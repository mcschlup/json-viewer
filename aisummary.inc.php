<?php

/*
 * include file: AI Summary fetch logic.
 * Exposes fetchAiSummary($jsonText) returning an associative array.
 * On success: the parsed JSON object returned by the model.
 * On failure: ['error' => '<message>'].
 *
 * Configuration lives in $ai_summary_* variables in config.inc.php /
 * config-local.inc.php. Uses the AWS SDK for PHP (Bedrock Runtime).
 */

require_once __DIR__ . '/vendor/autoload.php';

use Aws\BedrockRuntime\BedrockRuntimeClient;
use Aws\Exception\AwsException;

function fetchAiSummary($jsonText) {
    global $ai_summary_aws_region, $ai_summary_aws_key, $ai_summary_aws_secret,
           $ai_summary_aws_token, $ai_summary_model_id, $ai_summary_system_prompt,
           $ai_summary_user_prompt, $ai_summary_body_extras, $ai_summary_timeout,
           $ai_summary_proxy;

    if (empty($ai_summary_model_id) || empty($ai_summary_aws_region)) {
        return ['error' => 'AI Summary is not configured.'];
    }

    $clientArgs = [
        'region'  => $ai_summary_aws_region,
        'version' => 'latest',
    ];
    if (!empty($ai_summary_aws_key) && !empty($ai_summary_aws_secret)) {
        $creds = [
            'key'    => $ai_summary_aws_key,
            'secret' => $ai_summary_aws_secret,
        ];
        if (!empty($ai_summary_aws_token)) {
            $creds['token'] = $ai_summary_aws_token;
        }
        $clientArgs['credentials'] = $creds;
    }
    $httpOpts = ['timeout' => $ai_summary_timeout ?: 60];
    if (!empty($ai_summary_proxy)) {
        $httpOpts['proxy'] = $ai_summary_proxy;
    }
    $clientArgs['http'] = $httpOpts;

    try {
        $client = new BedrockRuntimeClient($clientArgs);
    } catch (Exception $e) {
        error_log('Bedrock client init failed: ' . $e->getMessage());
        return ['error' => 'Bedrock client init failed: ' . $e->getMessage()];
    }

    // Build the request body. Default shape targets Anthropic Claude on Bedrock;
    // $ai_summary_body_extras (max_tokens, temperature, top_p, ...) is merged in.
    $userPrompt = rtrim($ai_summary_user_prompt) . "\n\n" . $jsonText;
    $body = array_merge([
        'anthropic_version' => 'bedrock-2023-05-31',
        'system'            => $ai_summary_system_prompt,
        'messages'          => [
            ['role' => 'user', 'content' => $userPrompt],
        ],
    ], is_array($ai_summary_body_extras) ? $ai_summary_body_extras : []);

    try {
        $result = $client->invokeModel([
            'modelId'     => $ai_summary_model_id,
            'contentType' => 'application/json',
            'accept'      => 'application/json',
            'body'        => json_encode($body),
        ]);
    } catch (AwsException $e) {
        $msg = $e->getAwsErrorMessage() ?: $e->getMessage();
        error_log('Bedrock invokeModel failed: ' . $msg);
        return ['error' => 'Bedrock request failed: ' . $msg];
    }

    $respBody = (string) $result['body'];
    $resp = json_decode($respBody, true);
    if (!is_array($resp) || empty($resp['content'][0]['text'])) {
        error_log('Bedrock response unexpected: ' . substr($respBody, 0, 1000));
        return ['error' => 'Unexpected Bedrock response format.'];
    }

    $text = $resp['content'][0]['text'];
    // The model usually wraps the JSON in a ```json ... ``` fence; strip it if present.
    if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $text, $m)) {
        $text = $m[1];
    }

    $parsed = json_decode(trim($text), true);
    if (!is_array($parsed)) {
        error_log('AI Summary text was not valid JSON: ' . substr($text, 0, 1000));
        return ['error' => 'AI Summary response was not valid JSON.'];
    }
    return $parsed;
}

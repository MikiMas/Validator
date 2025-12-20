import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/authServer";

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { adHeadline, adMessage } = await req.json();

    if (!adHeadline || !adMessage) {
      return NextResponse.json(
        { error: 'The ad title and message are required' },
        { status: 400 }
      );
    }

    // Basic length validation
    if (adHeadline.length > 100) {
      return NextResponse.json(
        { valid: false, reason: 'The ad title is too long (maximum 100 characters)', category: 'length', suggestion: 'Shorten the headline to 100 characters or less.' },
        { status: 200 }
      );
    }

    if (adMessage.length > 300) {
      return NextResponse.json(
        { valid: false, reason: 'The ad message is too long (maximum 300 characters)', category: 'length', suggestion: 'Shorten the message to 300 characters or less.' },
        { status: 200 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Additional validation for explicit keywords (same level as validateContent)
    const forbiddenKeywords = [
      // Adult content
      'porn', 'sex', 'sexual', 'xxx', 'adult', 'erotic',
      // Drugs
      'drug', 'cocaine', 'heroin', 'marijuana', 'weed',
      // Violence/illegal
      'terrorist', 'bomb', 'weapon', 'assassinate', 'kill',
      // Scams
      'scam', 'fraud', 'pyramid scheme', 'easy money', 'get rich quick',
      // Fake medications
      'miraculous', 'instant cure', 'magic pill'
    ];

    const lowerHeadline = adHeadline.toLowerCase();
    const lowerMessage = adMessage.toLowerCase();
    const hasForbiddenKeyword = forbiddenKeywords.some(keyword =>
      lowerHeadline.includes(keyword) || lowerMessage.includes(keyword)
    );

    if (hasForbiddenKeyword) {
      return NextResponse.json({
        valid: false,
        reason: 'The ad contains inappropriate words or terms that could harm your brand reputation.',
        category: 'content_inappropriate',
        suggestion: 'Please review and edit the ad copy to remove inappropriate terms.'
      });
    }

    const prompt = `
Act as an expert content moderator who protects a brand's reputation. Analyze the following ad content and determine if it is appropriate, legal, and safe to publish on social media.

AD HEADLINE: "${adHeadline}"
AD MESSAGE: "${adMessage}"

Evaluate the content based on these criteria:

1. INAPPROPRIATE CONTENT:
   - Adult, sexual or explicit content
   - Violence, hate, discrimination or harassment
   - Illegal drugs, alcohol or tobacco (if targeted at minors)
   - Gambling or betting
   - Terrorist or extremist content
   - Self-harm or suicide

2. ILLEGAL OR DECEPTIVE CONTENT:
   - Illegal or fraudulent activities
   - Scams, pyramid schemes or phishing
   - Counterfeiting documents or products
   - Sale of stolen goods or contraband
   - Content that violates copyright or intellectual property

3. HARMFUL OR DANGEROUS CONTENT:
   - Weapons, explosives or dangerous material
   - Dangerous chemical substances
   - Prescription drugs or controlled substances
   - Dangerous or unverified medical advice
   - Content that promotes risky behavior

4. REPUTATION DAMAGING CONTENT:
   - Offensive, vulgar or inappropriate language
   - Politically extremist or divisive content
   - Extremist religion or aggressive proselytizing
   - Conspiracy theories or disinformation
   - Content that could generate public backlash

5. INAPPROPRIATE COMMERCIAL CONTENT:
   - False or misleading promises
   - "Get rich quick" schemes
   - Miracle drugs or fake cures
   - Unregulated financial services
   - Low-quality products or scams

Respond ONLY in JSON format:
{
  "valid": true/false,
  "reason": "Clear and concise explanation of why the content is not valid (only if valid=false)",
  "category": "problem category (only if valid=false)",
  "suggestion": "suggestion to improve the content (optional)"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content moderator who responds only in valid JSON format. Do not include any additional text outside the JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error in OpenAI API:', errorData);
      return NextResponse.json(
        { error: 'Error validating content with AI' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    let validationResult: any;
    try {
      validationResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', aiResponse);
      return NextResponse.json({
        valid: true,
        reason: 'Basic validation passed (AI verification unavailable)'
      });
    }

    const sanitizedResult = {
      valid: typeof validationResult?.valid === 'boolean' ? validationResult.valid : true,
      reason: validationResult?.reason?.trim() || undefined,
      category: validationResult?.category?.trim() || undefined,
      suggestion: validationResult?.suggestion?.trim() || undefined,
      warnings: Array.isArray(validationResult?.warnings)
        ? validationResult.warnings.filter(Boolean)
        : []
    };

    if (!sanitizedResult.valid) {
      return NextResponse.json({
        ...sanitizedResult,
        reason: sanitizedResult.reason || 'The content violates our usage policies.',
        category: sanitizedResult.category || 'policy_violation',
        suggestion:
          sanitizedResult.suggestion ||
          'Please revise the wording so it complies with the guidelines.'
      });
    }

    return NextResponse.json(sanitizedResult);

  } catch (error) {
    console.error('Error validating ad content:', error);
    return NextResponse.json(
      { error: 'Internal server error while validating content' },
      { status: 500 }
    );
  }
}

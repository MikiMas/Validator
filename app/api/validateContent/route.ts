import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/authServer';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const title = body.title ?? body.projectName;
    const description = body.description ?? body.projectDescription;
    const waitlistText: string | undefined = body.waitlistText;
    const offerText: string | undefined = body.offerText;

    // Basic input validation
    if (!title?.trim() || !description?.trim()) {
      return NextResponse.json(
        { error: 'The project title and description are required' },
        { status: 400 }
      );
    }

    if (description.trim().length < 40) {
      return NextResponse.json(
        { error: 'The description must be at least 40 characters long' },
        { status: 400 }
      );
    }

    const hasWaitlistOffer = Boolean(offerText && offerText.trim().length > 0);

    // AI validation via OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const prompt = `
Act as an expert content moderator who protects a brand's reputation. Analyze the following project content and determine if it is appropriate, legal, and safe to use on a landing page.

PROJECT NAME: "${title}"
PROJECT DESCRIPTION: "${description}"
INCLUDES WAITLIST OFFER: ${hasWaitlistOffer ? 'Yes' : 'No'}

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
      const errorData = await response.json();
      console.error('Error in OpenAI API:', errorData);
      return NextResponse.json(
        { error: 'Error validating content with AI' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();

    let validationResult;
    try {
      validationResult = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', aiResponse);
      // If parsing fails, assume valid but warn that the AI couldn't verify it
      return NextResponse.json({
        valid: true,
        reason: 'Basic validation passed (AI verification unavailable)'
      });
    }

    // Additional validation for explicit keywords
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


    const lowerDescription = description.toLowerCase();
    const lowerName = title.toLowerCase();
    const hasForbiddenKeyword = forbiddenKeywords.some(keyword => 
      lowerDescription.includes(keyword) || lowerName.includes(keyword)
    );

    if (hasForbiddenKeyword) {
      return NextResponse.json({
        valid: false,
        reason: 'The content contains inappropriate words or terms that could harm your brand reputation.',
        category: 'content_inappropriate',
        suggestion: 'Please review and edit the content to remove inappropriate terms.'
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
      console.error('Error validating content:', error);
      return NextResponse.json(
        { error: 'Internal server error while validating content' },
        { status: 500 }
      );
  }
}

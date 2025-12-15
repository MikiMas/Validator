import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
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

    const { adHeadline, adMessage, adPicture } = await req.json();

    if (!adHeadline || !adMessage) {
      return NextResponse.json(
        { error: 'The ad title and message are required' },
        { status: 400 }
      );
    }

    // Basic length validation
    if (adHeadline.length > 100) {
      return NextResponse.json(
        { valid: false, reason: 'The ad title is too long (maximum 100 characters)' },
        { status: 200 }
      );
    }

    if (adMessage.length > 300) {
      return NextResponse.json(
        { valid: false, reason: 'The ad message is too long (maximum 300 characters)' },
        { status: 200 }
      );
    }

    // AI validation
    const prompt = `
Act as an expert content moderator in digital advertising.

Analyze the following ad content to determine if it is appropriate for social media advertising:

TITLE: "${adHeadline}"
MESSAGE: "${adMessage}"
${adPicture ? `IMAGE: ${adPicture}` : ''}

Evaluation criteria:
1. Misleading or fraudulent content
2. Unrealistic or exaggerated promises
3. Offensive, discriminatory or hateful content
4. Illegal or regulated products/services
5. False or unverified medical information
6. Copyright infringement
7. Content inappropriate for general audience

Respond ONLY in JSON format:
{
  "valid": true/false,
  "reason": "Brief explanation if not valid"
}

If the content is legitimate and appropriate, respond with {"valid": true}.
If there is any problem, respond with {"valid": false, "reason": "explanation"}.
`;

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      // Fallback: allow basic content if OpenAI is not available
      return NextResponse.json({ valid: true });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const aiResponse = completion.choices[0].message.content;
    
    try {
      const validationResult = JSON.parse(aiResponse || '{}');
      
      if (validationResult.valid === false) {
        return NextResponse.json({
          valid: false,
          reason: validationResult.reason || 'The ad content is not appropriate for advertising'
        });
      }
      
      return NextResponse.json({ valid: true });
      
    } catch (parseError) {
      console.error('Error parsing AI response:', aiResponse);
      // Fallback: allow if there is a parsing error
      return NextResponse.json({ valid: true });
    }

  } catch (error) {
    console.error('Error validating ad content:', error);
    return NextResponse.json(
      { error: 'Internal server error while validating content' },
      { status: 500 }
    );
  }
}

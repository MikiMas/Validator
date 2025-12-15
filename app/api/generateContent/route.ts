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

    const { projectDescription, projectName } = await request.json();

    if (!projectDescription || !projectName) {
      return NextResponse.json(
        { error: 'Project description and project name are required' },
        { status: 400 }
      );
    }

    // Prompt to generate landing page content
    const landingPrompt = `You are an expert copywriter specializing in converting landing pages for startups.

Based on this project description:
"${projectDescription}"

Project name (internal reference): "${projectName}"

Analyze the project in depth and generate content that CLEARLY communicates the unique value proposition.

Identify:
1. The specific PROBLEM it solves
2. The unique SOLUTION it offers
3. The main BENEFIT for the user
4. Why it is BETTER than existing alternatives?

Generate content for a minimalist and effective landing page:

1. **Main Title**: Must communicate the main BENEFIT, not the project name
   - BAD: "Welcome to MyApp", "The Definitive Solution"
   - GOOD: "Reduce Time 50%", "Automatic Billing", "No More Debtors"
   - Maximum 60 characters

2. **Description**: Clearly explain the problem and unique solution
   - Focus on the RESULT for the user
   - Use specific numbers if possible
   - Mention why it is different/better
   - 150-200 characters

3. **Waitlist Offer**: Irresistible offer that reflects real value
   - Examples: "Early access + 30% discount", "Free trial 6 months"
   - Must be relevant to the main benefit

Respond ONLY in JSON format:
{
  "ideaName": "Main benefit as title",
  "ideaDescription": "Value-focused description",
  "waitlistOffer": "Benefit-relevant offer"
}

EXAMPLES by project type:
- SaaS B2B: "Automate Billing", "Reduce operating costs 40%", "Free demo + 20% discount"
- Productivity App: "Recover 10h/week", "Organize your life in 5 min/day", "Premium early access"
- Marketplace: "35% cheaper prices", "Never hidden fees", "Free registration + free shipping"
- Educational: "Learn 3x faster", "Certificate in 2 weeks", "First course free + 50% discount"`;

    // Prompt to generate ad content
    const adPrompt = `You are an expert in Meta Ads digital advertising specializing in creating converting ads.

Based on this project description:
"${projectDescription}"

Project name: "${projectName}"

Analyze the project in depth and create an ad that highlights ITS OWN UNIQUE VALUE PROPOSITION. DO NOT use generic phrases.

Identify:
1. The specific PROBLEM it solves
2. The unique SOLUTION it offers
3. The main BENEFIT for the user
4. Why it is BETTER than alternatives?

Generate content for an effective and SPECIFIC ad:

1. **Headline**: Title that communicates the main benefit (maximum 30 characters)
   - BAD examples: "Discover MyApp", "Tech Innovation"
   - GOOD examples: "Reduce Costs 50%", "Automate Billing", "No More Debtors"

2. **Message**: Text that CLEARLY explains the value proposition (maximum 125 characters)
   - Focus on the RESULT, not the feature
   - Use specific numbers if possible
   - Mention the problem it solves

3. **Image**: URL of a stock image compatible with Meta Ads
   - Must represent the FINAL BENEFIT, not the technology
   - Use images of people if B2C, businesses if B2B

For the image, use URLs from Pexels or Pixabay with this format:
https://images.pexels.com/photos/[ID]/[description].jpg

Respond ONLY in JSON format:
{
  "adHeadline": "Specific benefit here",
  "adMessage": "Clear value proposition here",
  "adPicture": "Image URL here"
}

EXAMPLES:
- If it's a management app: "Gain 10h/week", "Recover lost time"
- If it's SaaS B2B: "Reduce costs 30%", "Automatic billing"
- If it's marketplace: "40% cheaper prices", "No hidden fees"
- If it's educational: "Learn 3x faster", "Certificate in 2 weeks"`;

    // OpenAI calls
    const [landingResponse, adResponse] = await Promise.all([
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: landingPrompt }],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }),
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: adPrompt }],
          temperature: 0.7,
          max_tokens: 300,
        }),
      }),
    ]);

    if (!landingResponse.ok || !adResponse.ok) {
      throw new Error('Error generating content with AI');
    }

    const [landingData, adData] = await Promise.all([
      landingResponse.json(),
      adResponse.json(),
    ]);

    // Parse responses
    let landingContent, adContent;
    
    try {
      landingContent = JSON.parse(landingData.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON is not valid - more specific based on the project
      const description = projectDescription.substring(0, 150);
      landingContent = {
        ideaName: `Solution for ${projectName}`,
        ideaDescription: description,
        waitlistOffer: "Early access with exclusive benefits"
      };
    }

    try {
      adContent = JSON.parse(adData.choices[0].message.content);
    } catch (e) {
      // Fallback if JSON is not valid - more specific based on the project
      adContent = {
        adHeadline: `Solve your problem`,
        adMessage: `The specific solution you need. Register now.`,
        adPicture: "https://images.pexels.com/photos/3184418/pexels-photo.jpg"
      };
    }

    return NextResponse.json({
      landingContent: {
        ...landingContent,
        sections: [] // Additional sections can be added if needed
      },
      adContent
    });

  } catch (error: any) {
    console.error('Error in generateContent:', error);
    
    // Basic fallback if everything fails
    return NextResponse.json({
      landingContent: {
        ideaName: "Solution for your project",
        ideaDescription: "The specific solution you need",
        waitlistOffer: "Early access with exclusive benefits",
        sections: []
      },
      adContent: {
        adHeadline: "Solve your problem now",
        adMessage: "The specific solution you're looking for. Register for free.",
        adPicture: "https://images.pexels.com/photos/3184418/pexels-photo.jpg"
      }
    });
  }
}

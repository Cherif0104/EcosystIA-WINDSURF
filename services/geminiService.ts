import { GoogleGenAI, Modality } from "@google/genai";
import { Project, Task, User, Contact } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Running in mock mode. Set VITE_API_KEY to enable real AI features.");
}

// Only initialize AI if API key is available
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// --- Existing Functions ---

export const runAICoach = async (prompt: string): Promise<string> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `This is a mock response because the Gemini API key is not configured. 
    For your prompt: "${prompt}", here's a sample idea:
    **Project Idea: 'Agile SaaS Launch'**
    *   **Concept:** A mobile-first platform for agile project management.
    *   **Features:** Kanban boards, sprint planning, burndown charts.
    *   **Impact:** Increases team velocity and reduces time to market.`;
  }

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: `You are an expert project and strategy coach for EcosystIA, a platform empowering teams and individuals. Your goal is to provide actionable, encouraging, and contextually relevant advice. When asked for project ideas, focus on sustainability, social impact, and technological feasibility. Structure your answers clearly with headings, bullet points, or numbered lists. Always maintain a positive and empowering tone.`,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error. Please try again later.";
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return "iVBORw0KGgoAAAANSUhEUgAAAYAAAACDCAYAAACY/QxGAAABmklEQVR4nO3WsQ2AMAwEwXEFYk9/SAgI/yFCAi3B5sC57N7dHYCAAIGvAgwIuAEDAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgAABAgQIECBAgACBEgQYELCBAQECBAgQIECAAAECBAgQIECAAAECBAgQIEDgLwIMCLgBAwIECBD4sQdeCEYqQY3EAAAAAElFTkSuQmCC";
    }

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {numberOfImages: 1, outputMimeType: 'image/png'},
        });
        
        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return "";
    } catch (error) {
        console.error("Error generating image:", error);
        return "";
    }
}

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<{ image: string, text: string }> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            image: base64Image, // Return original for mock
            text: "This is a mock response for image editing. The image was not actually changed."
        };
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let editedImage = "";
        let responseText = "";
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    responseText = part.text;
                } else if (part.inlineData) {
                    editedImage = part.inlineData.data;
                }
            }
        }
        
        return { image: editedImage, text: responseText };
    } catch (error) {
        console.error("Error editing image:", error);
        return { image: "", text: "Sorry, I encountered an error during image editing." };
    }
};


// --- Helper function for JSON parsing ---
const parseJsonResponse = (text: string) => {
    let jsonStr = text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        console.error("Original string:", text);
        return null;
    }
};

// --- New Enhanced Functions ---

export const enhanceProjectTasks = async (projectDescription: string, team: User[]): Promise<any[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return [
            { text: "Define project scope and objectives", priority: 'High', assigneeId: team[0]?.id || null },
            { text: "Conduct stakeholder analysis", priority: 'Medium', assigneeId: team[1]?.id || null },
            { text: "Develop a preliminary budget", priority: 'High', assigneeId: team[0]?.id || null },
            { text: "Create a project timeline", priority: 'Medium', assigneeId: team[1]?.id || null },
        ];
    }
    
    try {
        const teamInfo = team.map(m => `id: ${m.id}, name: ${m.name}, skills: [${m.skills.join(', ')}]`).join('; ');
        const prompt = `Based on the project description and team composition, generate a list of key tasks. For each task, assign a priority ('High', 'Medium', 'Low') and suggest an assignee from the team by their id.
        Project Description: "${projectDescription}"
        Team: [${teamInfo}]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              systemInstruction: `You are a silent API. Your response must be only a valid JSON array of objects. Each object must have "text" (string), "priority" (string: 'High', 'Medium', or 'Low'), and "assigneeId" (number, can be null). Do not include any explanations, commentary, or markdown fences. The entire response must be a single, parsable JSON structure.`,
              responseMimeType: "application/json",
              thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return parseJsonResponse(response.text) || [];
    } catch (error) {
        console.error("Error enhancing project tasks:", error);
        return [];
    }
};

export const summarizeTasks = async (tasks: Task[]): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `**Task Summary:**\n- There are ${tasks.length} total tasks.\n- ${tasks.filter(t => t.status === 'Done').length} are completed.\n- Key focus areas appear to be planning and initial setup.`;
    }
    try {
        const taskText = tasks.map(t => `- ${t.text} (Status: ${t.status})`).join('\n');
        const prompt = `Please provide a brief summary of the following list of project tasks. Highlight key themes, overall progress, and any potential areas of focus.\n\n${taskText}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a project analyst. Your job is to provide concise, insightful summaries of task lists. Use markdown for formatting.",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing tasks:", error);
        return "Failed to generate summary.";
    }
};

export const identifyRisks = async (projectDescription: string): Promise<any[]> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return [
            { description: "Potential budget overruns due to vendor price increases.", likelihood: 'Medium', impact: 'High', mitigationStrategy: "Secure fixed-price contracts with vendors and allocate a 15% contingency fund." },
            { description: "Delays in timeline due to team member unavailability.", likelihood: 'Low', impact: 'Medium', mitigationStrategy: "Cross-train team members on critical tasks and have a list of pre-approved freelancers." },
        ];
    }

    try {
        const prompt = `For the following project, identify potential risks. For each risk, provide a description, likelihood ('Low', 'Medium', 'High'), impact ('Low', 'Medium', 'High'), and a suggested mitigation strategy.
        Project: "${projectDescription}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a silent API. Your response must be only a valid JSON array of risk objects. Each object must have "description" (string), "likelihood" (string: 'Low', 'Medium', 'High'), "impact" (string: 'Low', 'Medium', 'High'), and "mitigationStrategy" (string). Do not include any explanations, commentary, or markdown fences. The entire response must be a single, parsable JSON structure.`,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return parseJsonResponse(response.text) || [];
    } catch (error) {
        console.error("Error identifying risks:", error);
        return [];
    }
};

export const generateOKRs = async (projectDescription: string): Promise<any[]> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return [{
            title: "Successfully launch the project and drive initial user engagement",
            keyResults: [
                { title: "Achieve 500 active users in the first quarter", target: 500, unit: "users" },
                { title: "Obtain a customer satisfaction score of 4.5/5", target: 4.5, unit: "/5" },
                { title: "Complete 100% of launch-critical tasks on time", target: 100, unit: "%" },
            ]
        }];
    }
     try {
        const prompt = `Generate a set of 1-2 strategic objectives with 2-3 key results (OKRs) for the following project.
        Project: "${projectDescription}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a silent API. Your response must be only a valid JSON array of objective objects. Each object must have a "title" (string) and a "keyResults" array. Each key result object must have "title" (string), "target" (number), and "unit" (string). Do not include any explanations, commentary, or markdown fences. The entire response must be a single, parsable JSON structure.`,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return parseJsonResponse(response.text) || [];
    } catch (error) {
        console.error("Error generating OKRs:", error);
        return [];
    }
};

export const draftSalesEmail = async (contact: Contact, user: User): Promise<string> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Subject: Exploring a Partnership with ${contact.company}

Dear ${contact.name},

I hope this email finds you well.

My name is ${user.name}, and I'm a ${user.role} at EcosystIA. I'm writing to you today because I believe there could be a strong synergy between our organizations.

We are focused on empowering teams through AI-driven project management, and we see great potential for collaboration with ${contact.company}.

Would you be open to a brief chat next week to explore this further?

Best regards,
${user.name}`;
    }
    try {
        const prompt = `Draft a professional and concise introductory sales email from ${user.name}, a ${user.role} at EcosystIA, to ${contact.name} at ${contact.company}. The goal is to initiate a conversation about a potential partnership.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error drafting sales email:", error);
        return "Failed to generate email.";
    }
};

export const summarizeAndCreateDoc = async (text: string): Promise<{ title: string; content: string } | null> => {
     if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            title: "Summary of Pasted Text",
            content: "This is a mock summary of the text you provided. The AI identified the key points and created this concise overview. In a real scenario, this would contain the main ideas, action items, and conclusions from the original text."
        };
    }
    try {
        const prompt = `Analyze the following text. Generate a concise title and a summary of the key points and action items.
        Text: "${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a silent API. Your response must be only a valid JSON object with two properties: "title" (string) and "content" (string). Do not include any explanations, commentary, or markdown fences. The entire response must be a single, parsable JSON structure.`,
                responseMimeType: "application/json",
                thinkingConfig: { thinkingBudget: 0 },
            }
        });
        return parseJsonResponse(response.text);
    } catch (error) {
        console.error("Error summarizing document:", error);
        return null;
    }
};

export const generateStatusReport = async (project: Project): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `**Project Status Report: ${project.title}**

*   **Overall Status:** ${project.status}
*   **Summary:** The project is progressing steadily. We have completed several key tasks and are on track to meet the upcoming milestones. The team is collaborating effectively.
*   **Next Steps:** Focus on completing the remaining high-priority tasks and preparing for the next phase.`;
    }
    const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
    const totalTasks = project.tasks.length;
    const taskSummary = project.tasks.map(t => `- ${t.text} (Status: ${t.status})`).join('\n');

    try {
        const prompt = `Generate a brief status report for the following project.
        Project Title: ${project.title}
        Description: ${project.description}
        Due Date: ${project.dueDate}
        Overall Status: ${project.status}
        Tasks (${completedTasks}/${totalTasks} completed):
        ${taskSummary}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a project manager. Write a clear, concise status report. Use markdown for formatting (e.g., **headings**, *italics*, bullet points).",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating status report:", error);
        return "Failed to generate report.";
    }
};

export const runAIAgent = async (prompt: string, context: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return `This is a mock AI Agent response for the '${context}' view. You asked: "${prompt}". In a real scenario, I would provide helpful, context-specific guidance based on your current page.`;
    }

    let systemInstruction = "You are a friendly and helpful general assistant for EcosystIA, an application designed to empower teams and individuals. Your goal is to help users navigate and maximize the value of the app. Be concise and clear. Use markdown for lists if needed.";

    switch (context) {
        case 'dashboard':
            systemInstruction = "You are an assistant on the EcosystIA dashboard. Help users find information, navigate to other sections (like 'Projects' or 'Courses'), and understand their overview. Be proactive and encouraging.";
            break;
        case 'projects':
        case 'project_detail':
            systemInstruction = "You are a project management expert and coach. Help users with their projects by suggesting tasks, identifying risks, drafting project descriptions, or explaining concepts like agile or OKRs.";
            break;
        case 'goals_okrs':
            systemInstruction = "You are a strategy coach specializing in OKRs (Objectives and Key Results). Help users define ambitious but achievable goals for their projects. Explain how to write effective Key Results.";
            break;
        case 'courses':
        case 'course_detail':
            systemInstruction = "You are a learning and curriculum development coach. Help users find courses, understand topics, or suggest learning paths. Encourage lifelong learning and skill development.";
            break;
        case 'course_management':
             systemInstruction = "You are a curriculum design expert. Help administrators and managers create effective and engaging courses. Suggest module structures, lesson ideas, and assessment methods.";
             break;
        case 'jobs':
        case 'create_job':
            systemInstruction = "You are a career coach. Help job seekers find roles, give tips for applying, or suggest skills to add to their profile. For employers, help them write clear and attractive job descriptions.";
            break;
        case 'crm_sales':
            systemInstruction = "You are a CRM and sales assistant. Help users manage their contacts, draft compelling outreach emails, and suggest strategies for moving leads through the sales pipeline from 'Lead' to 'Customer'.";
            break;
        case 'leave_management':
            systemInstruction = "You are an HR assistant. Help users request time off, understand their leave balance, or if they are a manager, how to approve/reject requests from the 'Team Requests' tab.";
            break;
        case 'settings':
            systemInstruction = "You are an assistant helping users manage their profile and settings. Guide them on adding skills to their 'Skill Passport' or changing language preferences.";
            break;
        case 'knowledge_base':
            systemInstruction = "You are an information management assistant. Help users with the knowledge base by showing how to summarize text into documents or how to organize information effectively.";
            break;
        case 'gen_ai_lab':
            systemInstruction = "You are a creative assistant in the Generative AI Lab. Help users write effective prompts for the image generator, brainstorm creative ideas, and explore the potential of generative AI.";
            break;
        case 'analytics':
        case 'talent_analytics':
            systemInstruction = "You are a data analyst assistant. Help users understand the charts and metrics presented in the analytics dashboards. Explain concepts like 'skill gap analysis' or 'user growth' in simple terms.";
            break;
        case 'user_management':
            systemInstruction = "You are an admin assistant. Help the platform administrator understand user roles and permissions. Explain the different user role categories and what each group typically does.";
            break;
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for AI Agent:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
};


export const runAuthAIAssistant = async (prompt: string): Promise<string> => {
    if (!API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (prompt.toLowerCase().includes("role")) {
            return `**Youth:** For students and entrepreneurs.\n**Partner:** For employers, trainers, and funders.\n**Contributor:** For experts like mentors and coaches.\n**Staff:** For internal team members.`;
        }
        return `This is a mock response. To reset your password, please look for a 'Forgot Password' link on the login page.`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a helpful and secure AI assistant for the EcosystIA authentication page. Your primary goal is to assist users with login and signup questions without compromising security.

- If a user asks about a forgotten password, provide this exact, safe, generic advice: "To reset your password, you should look for a 'Forgot Password?' link on the login page. Clicking it will guide you through the process, which usually involves sending a secure reset link to your registered email address." **Under no circumstances should you ask for their email or any other personal information.**

- If a user asks about the difference between roles, provide these clear, concise definitions for the role CATEGORIES:
    - "**Youth:** This category is for young individuals, including **Students** who are learning and **Entrepreneurs** who are building new ventures."
    - "**Partner:** This category is for organizations and individuals collaborating with the platform, such as **Employers** offering jobs, **Trainers** providing courses, **Funders** supporting projects, and **Implementers** executing them."
    - "**Contributor:** This group includes experts who share their knowledge and skills, like **Mentors, Coaches, Facilitators, Publishers, Editors, Producers, Artists,** and **Alumni**."
    - "**Staff:** These are internal team members who help run the platform, including **Interns, Supervisors, Managers,** and **Administrators**."
    - "**Super Administrator:** This is a special role for managing the entire application."

- For any other questions, provide brief, helpful guidance related to signing in or creating an account. Keep your answers short and to the point.
`,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for Auth AI Agent:", error);
        return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
    }
};
/* =========================================================
   KUTS GLOBAL HUB
   platforms.js
   ---------------------------------------------------------
   Single source of truth for external platform records.
   hub.js reads this array and builds the interface dynamically.

   Initial system target:
   - 10 AI Platforms
   - 10 Search Engines
   - 10 Social & Code platforms
   - 30 platforms total
   ========================================================= */

window.platforms = [

    /* =======================================================
       01. AI PLATFORMS — 10
       ======================================================= */

    {
        id: "ai-chatgpt",
        category: "AI Platforms",
        name: "ChatGPT",
        url: "https://chatgpt.com",
        action: "CONNECT →",
        description: "AI assistant for writing, analysis, research, coding and more.",
        keywords: ["ai", "assistant", "openai", "chat", "writing", "coding"],
        icon: "https://chatgpt.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "ai-claude",
        category: "AI Platforms",
        name: "Claude",
        url: "https://claude.ai",
        action: "CONNECT →",
        description: "AI assistant for reasoning, writing, analysis and coding.",
        keywords: ["ai", "assistant", "anthropic", "reasoning", "writing", "coding"],
        icon: "https://claude.ai/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "ai-gemini",
        category: "AI Platforms",
        name: "Google Gemini",
        url: "https://gemini.google.com",
        action: "CONNECT →",
        description: "Google's AI assistant for multimodal work, research and productivity.",
        keywords: ["ai", "google", "gemini", "assistant", "research", "productivity"],
        icon: "https://gemini.google.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "ai-google-ai-studio",
        category: "AI Platforms",
        name: "Google AI Studio",
        url: "https://aistudio.google.com",
        action: "CONNECT →",
        description: "Google's workspace for experimenting with Gemini models and AI development.",
        keywords: ["ai", "google", "gemini", "developer", "studio", "api", "development"],
        icon: "https://aistudio.google.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "ai-microsoft-copilot",
        category: "AI Platforms",
        name: "Microsoft Copilot",
        url: "https://copilot.microsoft.com",
        action: "CONNECT →",
        description: "Microsoft's AI assistant for everyday tasks and productivity.",
        keywords: ["ai", "microsoft", "copilot", "assistant", "productivity", "office"],
        icon: "https://copilot.microsoft.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "ai-perplexity",
        category: "AI Platforms",
        name: "Perplexity",
        url: "https://www.perplexity.ai",
        action: "CONNECT →",
        description: "AI-powered answer and research engine with source-backed responses.",
        keywords: ["ai", "research", "search", "citations", "answers", "perplexity"],
        icon: "https://www.perplexity.ai/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "ai-grok",
        category: "AI Platforms",
        name: "Grok",
        url: "https://grok.com",
        action: "CONNECT →",
        description: "AI assistant from xAI for conversation, reasoning and research.",
        keywords: ["ai", "xai", "grok", "assistant", "reasoning", "research"],
        icon: "https://grok.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "ai-mistral",
        category: "AI Platforms",
        name: "Mistral Le Chat",
        url: "https://chat.mistral.ai",
        action: "CONNECT →",
        description: "Mistral's conversational AI platform for general and professional use.",
        keywords: ["ai", "mistral", "le chat", "assistant", "european ai"],
        icon: "https://chat.mistral.ai/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "ai-deepseek",
        category: "AI Platforms",
        name: "DeepSeek",
        url: "https://chat.deepseek.com",
        action: "CONNECT →",
        description: "AI platform focused on reasoning, mathematics, coding and general tasks.",
        keywords: ["ai", "deepseek", "reasoning", "coding", "math", "developer"],
        icon: "https://chat.deepseek.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "ai-meta",
        category: "AI Platforms",
        name: "Meta AI",
        url: "https://www.meta.ai",
        action: "CONNECT →",
        description: "Meta's AI assistant and creative AI platform.",
        keywords: ["ai", "meta", "assistant", "social", "creative", "llama"],
        icon: "https://www.meta.ai/favicon.ico",
        status: "online",
        featured: false
    },


    /* =======================================================
       02. SEARCH ENGINES — 10
       ======================================================= */

    {
        id: "search-google",
        category: "Search Engines",
        name: "Google Search",
        url: "https://www.google.com",
        action: "LAUNCH →",
        description: "General-purpose web search from Google.",
        keywords: ["search", "google", "web", "internet", "search engine"],
        icon: "https://www.google.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "search-bing",
        category: "Search Engines",
        name: "Bing",
        url: "https://www.bing.com",
        action: "LAUNCH →",
        description: "Microsoft's general-purpose web search engine.",
        keywords: ["search", "bing", "microsoft", "web", "internet"],
        icon: "https://www.bing.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "search-duckduckgo",
        category: "Search Engines",
        name: "DuckDuckGo",
        url: "https://duckduckgo.com",
        action: "LAUNCH →",
        description: "Privacy-focused search engine and web tools.",
        keywords: ["search", "privacy", "private", "duckduckgo", "web"],
        icon: "https://duckduckgo.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "search-brave",
        category: "Search Engines",
        name: "Brave Search",
        url: "https://search.brave.com",
        action: "LAUNCH →",
        description: "Privacy-focused search powered by Brave's independent search index.",
        keywords: ["search", "brave", "privacy", "independent index", "web"],
        icon: "https://search.brave.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "search-startpage",
        category: "Search Engines",
        name: "Startpage",
        url: "https://www.startpage.com",
        action: "LAUNCH →",
        description: "Privacy-oriented search experience with anonymous searching.",
        keywords: ["search", "startpage", "privacy", "private", "anonymous"],
        icon: "https://www.startpage.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "search-ecosia",
        category: "Search Engines",
        name: "Ecosia",
        url: "https://www.ecosia.org",
        action: "LAUNCH →",
        description: "Web search engine that supports environmental projects.",
        keywords: ["search", "ecosia", "environment", "green", "web"],
        icon: "https://www.ecosia.org/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "search-kagi",
        category: "Search Engines",
        name: "Kagi",
        url: "https://kagi.com",
        action: "LAUNCH →",
        description: "Subscription-based search engine focused on quality and control.",
        keywords: ["search", "kagi", "private", "premium", "web"],
        icon: "https://kagi.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "search-yahoo",
        category: "Search Engines",
        name: "Yahoo Search",
        url: "https://search.yahoo.com",
        action: "LAUNCH →",
        description: "Established general-purpose web search service.",
        keywords: ["search", "yahoo", "web", "internet"],
        icon: "https://search.yahoo.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "search-baidu",
        category: "Search Engines",
        name: "Baidu",
        url: "https://www.baidu.com",
        action: "LAUNCH →",
        description: "Major web search engine serving Chinese-language users.",
        keywords: ["search", "baidu", "china", "chinese", "web"],
        icon: "https://www.baidu.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "search-yandex",
        category: "Search Engines",
        name: "Yandex",
        url: "https://yandex.com",
        action: "LAUNCH →",
        description: "Search and internet services platform with broad web coverage.",
        keywords: ["search", "yandex", "web", "internet", "search engine"],
        icon: "https://yandex.com/favicon.ico",
        status: "online",
        featured: false
    },


    /* =======================================================
       03. SOCIAL & CODE — 10
       ======================================================= */

    {
        id: "social-github",
        category: "Social & Code",
        name: "GitHub",
        url: "https://github.com",
        action: "ACCESS →",
        description: "Code hosting, open-source collaboration and developer community.",
        keywords: ["code", "github", "git", "developer", "opensource", "repository"],
        icon: "https://github.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "social-gitlab",
        category: "Social & Code",
        name: "GitLab",
        url: "https://gitlab.com",
        action: "ACCESS →",
        description: "DevOps and source-code collaboration platform.",
        keywords: ["code", "gitlab", "git", "developer", "devops", "repository"],
        icon: "https://gitlab.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "social-linkedin",
        category: "Social & Code",
        name: "LinkedIn",
        url: "https://www.linkedin.com",
        action: "OPEN →",
        description: "Professional networking, publishing and career platform.",
        keywords: ["social", "linkedin", "professional", "career", "networking"],
        icon: "https://www.linkedin.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "social-x",
        category: "Social & Code",
        name: "X",
        url: "https://x.com",
        action: "OPEN →",
        description: "Real-time social network for news, conversation and communities.",
        keywords: ["social", "x", "twitter", "news", "community", "network"],
        icon: "https://x.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "social-reddit",
        category: "Social & Code",
        name: "Reddit",
        url: "https://www.reddit.com",
        action: "OPEN →",
        description: "Community-driven discussion platform organized around topics.",
        keywords: ["social", "reddit", "community", "discussion", "forums"],
        icon: "https://www.reddit.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "social-stackoverflow",
        category: "Social & Code",
        name: "Stack Overflow",
        url: "https://stackoverflow.com",
        action: "ACCESS →",
        description: "Developer question-and-answer community and knowledge base.",
        keywords: ["code", "stackoverflow", "programming", "developer", "questions", "answers"],
        icon: "https://stackoverflow.com/favicon.ico",
        status: "online",
        featured: true
    },

    {
        id: "social-discord",
        category: "Social & Code",
        name: "Discord",
        url: "https://discord.com",
        action: "OPEN →",
        description: "Community and real-time communication platform.",
        keywords: ["social", "discord", "community", "developer", "chat", "communication"],
        icon: "https://discord.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "social-devto",
        category: "Social & Code",
        name: "DEV Community",
        url: "https://dev.to",
        action: "OPEN →",
        description: "Developer publishing and community platform.",
        keywords: ["code", "developer", "devto", "blog", "tutorials", "community"],
        icon: "https://dev.to/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "social-hashnode",
        category: "Social & Code",
        name: "Hashnode",
        url: "https://hashnode.com",
        action: "OPEN →",
        description: "Developer blogging and technical publishing platform.",
        keywords: ["code", "developer", "hashnode", "blog", "writing", "community"],
        icon: "https://hashnode.com/favicon.ico",
        status: "online",
        featured: false
    },

    {
        id: "social-codepen",
        category: "Social & Code",
        name: "CodePen",
        url: "https://codepen.io",
        action: "ACCESS →",
        description: "Online environment for building and sharing front-end code.",
        keywords: ["code", "codepen", "html", "css", "javascript", "frontend", "web"],
        icon: "https://codepen.io/favicon.ico",
        status: "online",
        featured: false
    }

];


/* =========================================================
   Optional catalog metadata
   ========================================================= */

window.platformCatalog = {
    version: "1.0.0",
    totalPlatforms: window.platforms.length,

    categories: {
        "AI Platforms": 10,
        "Search Engines": 10,
        "Social & Code": 10
    }
};
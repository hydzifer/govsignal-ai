export const TOPICS = [
  { id: "eu_ai_act", label: "EU AI Act", description: "EU AI Act legislation, implementation, guidance" },
  { id: "us_federal_ai", label: "US Federal AI", description: "US federal AI policy, executive orders, NIST" },
  { id: "us_state_ai", label: "US State AI", description: "State-level AI bills, California, New York, etc" },
  { id: "gpai", label: "GPAI", description: "Global Partnership on AI, international coordination" },
  { id: "chips_act", label: "CHIPS Act", description: "CHIPS Act, semiconductor policy" },
  { id: "export_controls", label: "Export Controls", description: "Export restrictions, BIS regulations" },
  { id: "datacenter", label: "Data Center", description: "Data center policy, infrastructure" },
  { id: "compute_infrastructure", label: "Compute Infrastructure", description: "Computing resources, GPU access" },
  { id: "standards", label: "Standards", description: "Technical standards, ISO, IEEE" },
  { id: "other", label: "Other", description: "General AI policy topics" },
] as const;

export const PRODUCT_CATEGORIES = [
  { id: "llm_api", label: "LLM API / Foundation Model", description: "Large Language Model APIs, foundation models" },
  { id: "computer_vision", label: "Computer Vision", description: "Image/video analysis, facial recognition" },
  { id: "chatbot", label: "Chatbot / Conversational AI", description: "Conversational AI, customer service bots" },
  { id: "rag_system", label: "RAG System", description: "Retrieval-augmented generation systems" },
  { id: "agent_platform", label: "AI Agent Platform", description: "AI agents, autonomous systems" },
  { id: "data_analytics", label: "Data Analytics", description: "AI-powered analytics, prediction" },
  { id: "other", label: "Other", description: "General AI systems" },
] as const;

export const TOPIC_IDS = TOPICS.map((t) => t.id);

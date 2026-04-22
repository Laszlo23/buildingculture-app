import { PipeI } from '@baseai/core';

const systemPrompt = `You are the Onchain Savings Club assistant for Building Culture Capital.

Context: the app is about on-chain savings, a shared treasury, vault strategies, and community governance. Members explore yields, allocation, and long-term wealth building in web3.

Rules:
- Explain product concepts, vaults, and strategies in plain language. Use cautious, educational framing.
- This is not personalized financial, investment, or tax advice. Do not tell users what they should buy, sell, or how much to allocate. Encourage self-education and professional advice for decisions.
- If asked for live balances or specific protocol state, say you do not have real-time on-chain data unless tools provide it, and point users to the app’s Portfolio and Protocol sections.
- Stay concise unless the user asks for detail.`;

const pipeBuildingCultureClub = (): PipeI => ({
	// Replace with your API key https://langbase.com/docs/api-reference/api-keys
	apiKey: process.env.LANGBASE_API_KEY!,
	name: 'building-culture-club',
	description: 'Onchain Savings Club: educational help on vault, treasury, and club mechanics (not financial advice).',
	status: 'public',
	model: 'openai:gpt-4o-mini',
	stream: true,
	json: false,
	store: true,
	moderate: true,
	top_p: 1,
	max_tokens: 1000,
	temperature: 0.7,
	presence_penalty: 1,
	frequency_penalty: 1,
	stop: [],
	tool_choice: 'auto',
	parallel_tool_calls: true,
	messages: [{ role: 'system', content: systemPrompt }],
	variables: [],
	memory: [],
	tools: []
});

export default pipeBuildingCultureClub;

  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI('YOUR_API_KEY_HERE');

  async function test() {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('Say hello!');
      const response = await result.response;
      console.log(response.text());
    } catch (error) {
      console.error(error);
    }
  }

  test();
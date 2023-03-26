// 定义OpenAI API密钥和URL
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://api.openai.com/v1/';

// 获取当前选定的文本
function getSelectedText() {
  let selectedText = "";
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  }
  return selectedText;
}

// 向OpenAI API发送请求
function sendOpenAIRequest(prompt) {
  return fetch(API_URL + 'engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + API_KEY
    },
    body: JSON.stringify({
      prompt: prompt,
      max_tokens: 60,
      n: 1,
      stop: ['\n']
    })
  }).then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  }).then(data => {
    return data.choices[0].text.trim();
  }).catch(error => {
    console.error('Error:', error);
  });
}

// 创建右键菜单项并调用OpenAI API
chrome.contextMenus.create({
  title: "Generate code with OpenAI Codex",
  contexts:["selection"],
  onclick: function(info) {
    const prompt = getSelectedText();
    sendOpenAIRequest(prompt).then(response => {
      // 在当前标签页打开结果
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "openai_response", response: response});
      });
    });
  }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "get_api_key") {
    sendResponse(API_KEY);
  }
});

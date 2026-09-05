/**
 * MASTER PLAN COCKPIT — CONTEXTUAL CHATBOT ENGINE
 * Plafond strict : < 180 lignes
 */

class ChatEngine {
  constructor() {
    this.messagesContainer = document.getElementById('chat-messages-container');
    this.inputField = document.getElementById('chat-input-field');
    this.sendBtn = document.getElementById('btn-send-message');
    this.agentAvatar = document.getElementById('chat-agent-avatar');
    this.agentName = document.getElementById('chat-agent-name');
    this.agentRole = document.getElementById('chat-agent-role');
    this.currentTab = null;
    this.currentProject = null;
    this.pollInterval = null;
    this.lastCount = 0;

    this.setupListeners();
    this.startAutoSync();
  }

  setupListeners() {
    if (this.sendBtn) this.sendBtn.addEventListener('click', () => this.sendMessage());
    if (this.inputField) {
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
  }

  startAutoSync() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.pollInterval = setInterval(() => {
      if (this.currentTab?.id) {
        this.syncMessages(this.currentTab.id);
      }
    }, 1500);
  }

  setContext(tab, project) {
    this.currentTab = tab;
    this.currentProject = project;
    this.lastCount = 0;

    const profile = tab.agent_profile;
    if (this.agentAvatar) this.agentAvatar.textContent = profile.avatar;
    if (this.agentName) this.agentName.textContent = profile.name;
    if (this.agentRole) {
      this.agentRole.textContent = `Verrouillé sur [${project?.name || tab.title}] (${tab.pillar})`;
    }

    this.loadHistory(tab.id);
  }

  async loadHistory(tabId) {
    if (!this.messagesContainer) return;
    try {
      const res = await fetch(`/api/chat?tab=${tabId}`);
      const messages = await res.json();
      this.lastCount = messages.length;
      this.renderMessages(messages);
    } catch {
      this.messagesContainer.innerHTML = '<div style="font-size: 11px; color: var(--text-muted); text-align: center;">Historique prêt.</div>';
    }
  }

  async syncMessages(tabId) {
    try {
      const res = await fetch(`/api/chat?tab=${tabId}`);
      const messages = await res.json();
      if (Array.isArray(messages) && messages.length !== this.lastCount) {
        this.lastCount = messages.length;
        this.renderMessages(messages);
      }
    } catch {}
  }

  renderMessages(messages) {
    if (!this.messagesContainer) return;
    this.messagesContainer.innerHTML = '';

    messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `chat-bubble ${msg.sender}`;
      bubble.innerHTML = this.formatMarkdown(msg.text);
      this.messagesContainer.appendChild(bubble);
    });

    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  async sendMessage() {
    if (!this.inputField) return;
    const text = this.inputField.value.trim();
    if (!text || !this.currentTab) return;

    this.inputField.value = '';

    try {
      const res = await fetch(`/api/chat?tab=${this.currentTab.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          project_id: this.currentProject?.id,
          project_name: this.currentProject?.name
        })
      });

      const data = await res.json();
      if (data.messages) {
        this.lastCount = data.messages.length;
        this.renderMessages(data.messages);
      }
    } catch (err) {
      console.error('Erreur d\'envoi :', err);
    }
  }

  formatMarkdown(raw) {
    return (raw || '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="font-family: var(--font-mono); background: rgba(0,0,0,0.25); padding: 2px 5px; border-radius: 4px;">$1</code>')
      .replace(/\n/g, '<br>');
  }
}

window.ChatEngine = ChatEngine;

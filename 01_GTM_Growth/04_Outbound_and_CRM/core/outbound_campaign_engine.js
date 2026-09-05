/**
 * OUTBOUND CAMPAIGN ENGINE — SÉQUENCEUR 6 CAMPAGNES & VARIABLES (Node.js 24)
 * Pilier : 01_GTM_Growth / 04_Outbound_and_CRM / Core (< 140 lignes)
 */

const fs = require('node:fs');
const path = require('node:path');

const CONTACTS_FILE = path.join(__dirname, '../data/contacts_sniper_template.json');

const CAMPAIGN_TEMPLATES = {
  camp_loss_aversion: {
    name: "Aversion à la Perte / Coût Inaction",
    subject: "L'impact invisible du temps d'écran sur la productivité chez {{entreprise}}",
    body: `Bonjour {{prenom}},\n\nEn échangeant avec plusieurs {{role}}s, un chiffre revient souvent : les micro-interruptions et le temps d'écran non régulé réduisent la capacité de concentration profonde de 22% par jour.\n\nAevum permet de réintroduire des micro-respirations vagales de 30 secondes au déverrouillage d'écran pour restaurer la vitalité des équipes.\n\nSeriez-vous opposé à consulter notre synthèse chiffrée pour {{entreprise}} ?`,
    cta_label: "Consulter la synthèse chiffrée",
    target_url: "https://aevum.app/b2b-study"
  },
  camp_reciprocity_benchmark: {
    name: "Réciprocité Asymétrique / Baromètre Offert",
    subject: "Baromètre Santé Numérique & VRC 2026 (accès pour {{entreprise}})",
    body: `Bonjour {{prenom}},\n\nNous venons de finaliser le Baromètre 2026 sur la Variabilité Cardiaque (VRC) et l'hygiène numérique pour les {{role}}s.\n\nJe vous le transmets ci-joint en accès libre sans aucun formulaire.\n\nSi vous souhaitez mesurer l'impact de nos 12 protocoles physiologiques sur vos collaborateurs, faites-moi signe.`,
    cta_label: "Télécharger le Baromètre 2026",
    target_url: "https://aevum.app/barometre-vrc"
  },
  camp_social_proof_peers: {
    name: "Preuve Sociale Pairs",
    subject: "Comment d'autres scale-ups optimisent la récupération de leurs équipes",
    body: `Bonjour {{prenom}},\n\nPlusieurs équipes tech et produit comparables à {{entreprise}} intègrent désormais des protocoles de décompression rachidienne et de cohérence cardiaque directement sur iPhone.\n\nAevum a permis de stabiliser le score d'énergie de 88% des collaborateurs dès le premier mois.\n\nEst-ce un chantier ouvert chez {{entreprise}} ce trimestre ?`,
    cta_label: "Découvrir les retours d'expérience",
    target_url: "https://aevum.app/case-studies"
  }
};

class OutboundCampaignEngine {
  constructor(trackingBaseUrl = "http://localhost:4005") {
    this.trackingBaseUrl = trackingBaseUrl;
  }

  loadContacts() {
    try {
      if (fs.existsSync(CONTACTS_FILE)) {
        const raw = JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf-8'));
        return raw.contacts || [];
      }
    } catch {}
    return [];
  }

  generatePersonalizedEmail(contact) {
    const template = CAMPAIGN_TEMPLATES[contact.campaign_id] || CAMPAIGN_TEMPLATES.camp_loss_aversion;
    const cid = contact.campaign_id || "default_campaign";
    const uid = contact.id;

    // Remplacement des variables dynamiques
    const replaceVars = (text) => text
      .replace(/{{prenom}}/g, contact.prenom || "")
      .replace(/{{nom}}/g, contact.nom || "")
      .replace(/{{entreprise}}/g, contact.entreprise || "votre entreprise")
      .replace(/{{role}}/g, contact.role || "décideur");

    const subject = replaceVars(template.subject);
    const textBody = replaceVars(template.body);

    // Liens de tracking sécurisés
    const openTrackingPixel = `<img src="${this.trackingBaseUrl}/t/open?cid=${cid}&uid=${uid}" width="1" height="1" style="display:none;" alt="" />`;
    const clickTrackingUrl = `${this.trackingBaseUrl}/t/click?cid=${cid}&uid=${uid}&target=${encodeURIComponent(template.target_url)}`;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #1F2937;">
        ${textBody.replace(/\n\n/g, '<br><br>')}
        <br><br>
        <p><a href="${clickTrackingUrl}" style="color: #10B981; font-weight: 600; text-decoration: underline;">👉 ${template.cta_label}</a></p>
        <br>
        <p style="font-size: 11px; color: #9CA3AF;">Antoine Lecerf — Aevum Labs<br>Conformité RGPD : Répondez 'STOP' pour ne plus recevoir d'emails.</p>
        ${openTrackingPixel}
      </div>
    `;

    return {
      contact_id: uid,
      to_email: contact.email,
      to_name: `${contact.prenom} ${contact.nom}`,
      subject,
      text_body: textBody,
      html_body: htmlBody,
      campaign_name: template.name,
      target_url: template.target_url
    };
  }
}

if (require.main === module) {
  const engine = new OutboundCampaignEngine();
  console.log("=== TEST DU SÉQUENCEUR DE CAMPAGNES (PILIER 01 GTM) ===");
  const contacts = engine.loadContacts();
  if (contacts.length > 0) {
    const email = engine.generatePersonalizedEmail(contacts[0]);
    console.log(`📧 Destinataire : ${email.to_name} <${email.to_email}>`);
    console.log(`📌 Objet : ${email.subject}`);
    console.log(`🏷️ Campagne : ${email.campaign_name}`);
    console.log(`\nTexte Brut :\n${email.text_body}`);
  }
}

module.exports = { OutboundCampaignEngine, CAMPAIGN_TEMPLATES };

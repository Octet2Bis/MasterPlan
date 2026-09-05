---
name: longevity-protocol-engine
description: Moteur de protocoles physiologiques et règles de longévité (Healthspan) pour applications mobiles. Gère le catalogue scientifique des micro-défis, les algorithmes de timer respiratoire, les postures de décompression, et le scoring de vitalité. À utiliser dans 03_Developpement_App_and_Design/ et 01_GTM_Growth/.
---

# 🧬 Longevity Protocol Engine

Ce skill sert de référence algorithmique et biomécanique pour concevoir, calibrer et déclencher des micro-défis physiologiques validés scientifiquement (Peter Attia, Andrew Huberman, James Nestor, Matthew Walker).

---

## 🏛️ 1. Les 4 Catégories Reines & Algorithmes de Défi

```
                                  [LONGEVITY ENGINE]
                                          │
        ┌───────────────────┬─────────────┴─────────────┬───────────────────┐
        ▼                   ▼                           ▼                   ▼
 [1. RESPIRATION]   [2. MOBILITÉ]               [3. HYDRATATION]    [4. VISION]
 • Vague / Coeur    • Décompression rachis      • Électrolytes      • Muscle ciliaire
 • 30s à 60s        • 30s à 45s                 • 250ml             • 20 secondes
```

---

### A. Catégorie 1 : Système Nerveux & Respiration Vague

#### Protocole 1.1 : Le Soupir Physiologique (Physiological Sigh)
* **Origine Scientifique :** Dr. Andrew Huberman & Dr. Jack Feldman (Stanford).
* **Effet Biologique :** Réouverture des alvéoles pulmonaires collabées, décharge maximale de $CO_2$, stimulation parasympathique immédiate (baisse de la fréquence cardiaque en < 30 secondes).
* **Algorithme d'Exécution (3 Cycles) :**
  1. Inspiration profonde par le nez (2.5s)
  2. Sur-inspiration brève pour remplir le haut des poumons (1.0s)
  3. Expiration lente et relâchée par la bouche (5.0s)
  4. Durée totale : ~26 secondes.

#### Protocole 1.2 : Respiration Carrée (Box Breathing 4-4-4-4)
* **Origine Scientifique :** Navy SEALs & Mark Divine.
* **Effet Biologique :** Stabilisation du système nerveux autonome face au stress aigu et aux pics de cortisol.
* **Algorithme d'Exécution (3 Cycles = 48s) :**
  * Inspiration (4s) $\rightarrow$ Rétention poumons pleins (4s) $\rightarrow$ Expiration (4s) $\rightarrow$ Rétention poumons vides (4s).

---

### B. Catégorie 2 : Mobilité Posturale & Anti-Sédentarité (Desk Syndrome)

#### Protocole 2.1 : Décompression Spinale & Traction Axiale
* **Origine Scientifique :** Dr. Stuart McGill (*Back Mechanic*).
* **Effet Biologique :** Réhydratation des disques intervertébraux L4-L5/L5-S1 comprimés par 4h+ de position assise.
* **Algorithme (30 secondes) :**
  * Debout, pieds largeur d'épaules, bras tendus vers le ciel en entrelaçant les doigts. Inspirer en cherchant à grandir la colonne vers le haut, relâcher les épaules sans tasser le dos.

#### Protocole 2.2 : Couch Stretch (Ouverture du Psoas & Fléchisseurs)
* **Origine Scientifique :** Dr. Kelly Starrett (*Becoming a Supple Leopard*).
* **Effet Biologique :** Annulation de l'antéversion du bassin et inhibition du grand fessier causées par la flexion de hanche prolongée.
* **Algorithme (40s - 20s par jambe) :**
  * Fente avant, genou arrière au sol (ou contre une chaise), rétroversion volontaire du bassin, buste droit.

---

### C. Catégorie 3 : Métabolisme & Hydratation Cellulaire

#### Protocole 3.1 : Hydratation Électrolytique
* **Effet Biologique :** Réactivation de la pompe sodium-potassium cellulaire, élimination de la pseudo-léthargie cognitive de 14h.
* **Consigne :** Boire 250ml d'eau tiède/fraîche avec une micro-pincée de sel minéral ou électrolytes.

#### Protocole 3.2 : Micro-Marche de Lissage Glycémique
* **Effet Biologique :** Captation musculaire du glucose par contraction des soléaires/quadriceps (indépendante de l'insuline).
* **Consigne :** 60 secondes de marche active ou élévations de mollets (Soleus pushups).

---

### D. Catégorie 4 : Vision & Fatigue Cognitive

#### Protocole 4.1 : La Règle du 20-20-20
* **Origine Scientifique :** American Academy of Ophthalmology.
* **Effet Biologique :** Relâchement du spasme d'accommodation du muscle ciliaire de l'œil causé par la focalisation à 40cm d'écran.
* **Algorithme (20 secondes) :**
  * Fixer un point situé à au moins 6 mètres (20 pieds) ou regarder par la fenêtre l'horizon lointain.

---

## 📊 2. Modèle de Données & Calcul du "Score Aevum" (Vitality Index)

$$\text{Aevum Score} = \text{Base Score (100)} + (\text{Défis Validés} \times 5) - (\text{Temps d'Écran Excessif} \times 2)$$

* **Streak Multiplier :** $\times 1.1$ à partir de 3 jours consécutifs.
* **Biomarkers Sync :** Bonus si le HRV augmente ou si le sommeil profond dépasse 1h30 via HealthKit.

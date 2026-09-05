# 📋 BRIEF (Porte 0) : Aevum iOS (Healthspan & Anti-Screen Time)

## 1. Problème n°1 Résolu
L'hyper-connexion sédentaire dégrade l'espérance de vie en bonne santé (*Healthspan*). Les micro-pauses actives et la déconnexion intentionnelle sont difficiles à maintenir face aux designs addictifs des réseaux sociaux.

## 2. Persona & Contexte d'Usage
Professionnels du savoir et fondateurs passant plus de 7 heures par jour devant les écrans. L'application intervient lors des seuils critiques de temps d'écran (Screen Time API) ou aux micro-jalons circadiens (matin, post-déjeuner, transition de fin de journée).

## 3. Anti-Scope (No-Gos Stricts)
- ❌ **Pas de feed social ni de partage communautaire public** : Préservation du sanctuaire mental.
- ❌ **Pas de monétisation agressive ni de paywall bloquant le diagnostic initial**.
- ❌ **Pas de stockage de données biométriques sur serveur tiers** : 100% On-Device (HealthKit & SQLite chiffré).
- ❌ **Pas d'inlining de catalogues dans le code source**.

## 4. Appétit & Complexité
- **Appétit :** Architecture modulaire pérenne en Clean Architecture (Swift Concurrency strict).
- **Format :** Application iOS native native SwiftUI + Simulateur Web interactif pour démos et validation rapide.

## 5. Plateforme Cible
- **iOS 17.0+** (SwiftUI, FamilyControls, ManagedSettings, DeviceActivity, HealthKit).
- **Web Preview** (Vanilla CSS Swiss Craft, AudioContext API, Node.js static server).

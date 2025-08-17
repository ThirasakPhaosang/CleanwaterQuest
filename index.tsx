
import React, { useState, useEffect, useRef, useLayoutEffect, FC, ReactNode, DragEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, User, updateProfile, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs, runTransaction, increment, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { gsap } from 'gsap';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAAXqmfSy_q_Suh4td5PeLz-ZsuICf-KwI",
  authDomain: "cleanwater-quest.firebaseapp.com",
  projectId: "cleanwater-quest",
  storageBucket: "cleanwater-quest.appspot.com",
  messagingSenderId: "331042617564",
  appId: "1:331042617564:web:b00eeaf03d228ae4569c19"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });


// --- I18N LOCALIZATION ---
const translations = {
    en: {
        play: 'Play',
        signInWithGoogle: 'Sign in with Google',
        editProfile: 'Edit Profile',
        createProfile: 'Create Your Profile',
        enterYourName: 'Enter your name',
        chooseAvatar: 'Choose an Avatar',
        saving: 'Saving...',
        saveChanges: 'Save Changes',
        startAdventure: 'Start Adventure!',
        nameRequiredError: 'Please enter a name!',
        profileSaveError: 'Could not save profile. Please try again.',
        leaderboard: 'Leaderboard',
        weekly: 'Weekly',
        allTime: 'All-Time',
        weeklyPrize: 'Top player this week wins 💰 1000 Coins!',
        loadingRankings: 'Loading rankings...',
        noScoresYet: 'No scores recorded yet. Be the first!',
        leaderboardLoadError: 'Could not load the leaderboard. Please check your connection.',
        guest: 'Guest',
        adventurer: 'Adventurer',
        progressNotSaved: 'Your progress is not saved.',
        level: 'Level',
        setSail: 'Set Sail!',
        upgrades: 'Upgrades',
        backToTitle: 'Back to Title',
        logout: 'Logout',
        globalCleanupEffort: 'Global Cleanup Effort',
        totalItemsCollected: 'Total Items Collected',
        profileLoadError: 'Could not connect to load your profile. Please check your internet connection.',
        guestSessionError: 'Could not start a guest session. Please try again.',
        capacity: 'Capacity',
        score: 'Score',
        collectionPrompt: 'Move cursor to steer. <br/>Click and hold to lower hook.',
        boatFullPrompt: 'Boat is full! <br/>Returning to sort the haul.',
        organic: 'Organic',
        recyclable: 'Recycle',
        general: 'General',
        hazardous: 'Hazardous',
        greatJob: 'Great Job!',
        oops: 'Oops!',
        allSorted: 'All Sorted!',
        noTrashCollected: 'No Trash Collected!',
        noTrashDesc: "Let's try again on the next run.",
        backToHarbor: 'Back to Harbor',
        results: 'Results',
        finalScore: 'Final Score',
        correctlySorted: 'Correctly Sorted',
        incorrectlySorted: 'Incorrectly Sorted',
        rewards: 'Rewards!',
        coinsEarned: 'Coins Earned',
        xpGained: 'XP Gained',
        saveError: 'Failed to save progress. Please check your connection and retry.',
        retry: 'Retry',
        continue: 'Continue',
        initializing: 'Initializing...',
        dailyRewards: 'Daily Rewards',
        quests: 'Quests',
        day: 'Day',
        claim: 'Claim',
        claiming: 'Claiming...',
        claimed: 'Claimed',
        dailyQuests: 'Daily Quests',
        weeklyContracts: 'Weekly Contracts',
        questCollect: 'Collect {target} {type} items.',
        questScore: 'Achieve a score of {target} in a single run.',
        questSort: 'Correctly sort {target} items in one go.',
        upgradeCore: 'Upgrade Core',
        coralFragment: 'Coral Fragment',
        questComplete: 'Quest Complete!',
        upgradeBoatCapacity: 'Boat Capacity',
        upgradeHookSpeed: 'Hook Speed',
        upgradeDescCapacity: 'Increase the amount of trash you can carry.',
        upgradeDescHookSpeed: 'Lower and raise your hook faster.',
        upgrade: 'Upgrade',
        cost: 'Cost',
        maxLevel: 'Max Level',
        notEnoughResources: 'Not enough resources!',
        noDailyQuests: 'No daily quests. Check back tomorrow!',
        noWeeklyContract: 'No weekly contract. Check back next week!',
        loginRequired: 'Login Required',
        loginPromptMessage: 'Please sign in to access these features!',
        researchAndDev: 'R&D Lab',
        market: 'Market',
        coralReef: 'Coral Reef',
        research: 'Research',
        startResearch: 'Start Research',
        inProgress: 'In Progress',
        complete: 'Complete',
        researchTime: 'Time: {hours}h',
        marketOrders: 'Market Orders',
        craft: 'Craft',
        notEnoughItems: 'Not enough items!',
        orderRefreshesIn: 'New order in: {time}',
        boatCustomization: 'Boat Customization',
        boatColor: 'Boat Color',
        flag: 'Flag',
        mapPieces: 'Map Pieces',
        contribute: 'Contribute',
        reefRestoration: 'Reef Restoration',
        restorationProgress: 'Restoration Progress: {progress}%',
        endlessAbyss: 'Endless Abyss',
        comingSoon: 'Coming Soon',
        trash_1_name: 'Apple Core',
        trash_1_feedback: 'Fruit scraps are organic and can be composted!',
        trash_2_name: 'Plastic Bottle',
        trash_2_feedback: 'Clean plastic bottles are perfect for recycling.',
        trash_3_name: 'Chip Bag',
        trash_3_feedback: 'Greasy snack bags go in general waste.',
        trash_4_name: 'Battery',
        trash_4_feedback: 'Batteries contain harmful chemicals and must be disposed of safely.',
        trash_5_name: 'Fish Bones',
        trash_5_feedback: 'Just like other food waste, fish bones are organic.',
        trash_6_name: 'Newspaper',
        trash_6_feedback: 'Paper and cardboard are highly recyclable.',
        trash_7_name: 'Styrofoam Cup',
        trash_7_feedback: 'Dirty styrofoam is not recyclable and belongs in general waste.',
        trash_8_name: 'Light Bulb',
        trash_8_feedback: 'Old light bulbs, especially fluorescent ones, are hazardous waste.',
        trash_9_name: 'Banana Peel',
        trash_9_feedback: 'Banana peels are great for compost!',
        trash_10_name: 'Aluminum Can',
        trash_10_feedback: 'Recycle aluminum cans to save a lot of energy.',
        trash_11_name: 'Plastic Bag',
        trash_11_feedback: 'Plastic bags can harm wildlife and belong in general waste.',
        trash_12_name: 'Paint Can',
        trash_12_feedback: 'Old paint is considered hazardous waste.',
        trash_13_name: 'Message in a Bottle',
        trash_13_feedback: 'A fragment of an old map! What could it lead to?',
    },
    th: {
        play: 'เล่น',
        signInWithGoogle: 'ลงชื่อเข้าใช้ด้วย Google',
        editProfile: 'แก้ไขโปรไฟล์',
        createProfile: 'สร้างโปรไฟล์ของคุณ',
        enterYourName: 'ใส่ชื่อของคุณ',
        chooseAvatar: 'เลือกอวตาร',
        saving: 'กำลังบันทึก...',
        saveChanges: 'บันทึกการเปลี่ยนแปลง',
        startAdventure: 'เริ่มการผจญภัย!',
        nameRequiredError: 'กรุณาใส่ชื่อ!',
        profileSaveError: 'ไม่สามารถบันทึกโปรไฟล์ได้ กรุณาลองอีกครั้ง',
        leaderboard: 'กระดานผู้นำ',
        weekly: 'รายสัปดาห์',
        allTime: 'ตลอดกาล',
        weeklyPrize: 'ผู้เล่นอันดับสูงสุดประจำสัปดาห์รับ 💰 1000 เหรียญ!',
        loadingRankings: 'กำลังโหลดอันดับ...',
        noScoresYet: 'ยังไม่มีคะแนนที่ถูกบันทึก มาเป็นคนแรกกันเถอะ!',
        leaderboardLoadError: 'ไม่สามารถโหลดกระดานผู้นำได้ กรุณาตรวจสอบการเชื่อมต่อของคุณ',
        guest: 'ผู้เยี่ยมชม',
        adventurer: 'นักผจญภัย',
        progressNotSaved: 'ความคืบหน้าของคุณจะไม่ถูกบันทึก',
        level: 'เลเวล',
        setSail: 'ออกเรือ!',
        upgrades: 'อัปเกรด',
        backToTitle: 'กลับสู่หน้าหลัก',
        logout: 'ออกจากระบบ',
        globalCleanupEffort: 'สถิติการเก็บขยะทั่วโลก',
        totalItemsCollected: 'จำนวนขยะที่เก็บได้ทั้งหมด',
        profileLoadError: 'ไม่สามารถเชื่อมต่อเพื่อโหลดโปรไฟล์ของคุณได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        guestSessionError: 'ไม่สามารถเริ่มเซสชันผู้เยี่ยมชมได้ กรุณาลองอีกครั้ง',
        capacity: 'ความจุ',
        score: 'คะแนน',
        collectionPrompt: 'เลื่อนเมาส์เพื่อบังคับทิศทาง <br/>คลิกค้างไว้เพื่อปล่อยตะขอ',
        boatFullPrompt: 'เรือเต็มแล้ว! <br/>กำลังกลับไปคัดแยกขยะ',
        organic: 'ขยะอินทรีย์',
        recyclable: 'ขยะรีไซเคิล',
        general: 'ขยะทั่วไป',
        hazardous: 'ขยะอันตราย',
        greatJob: 'เยี่ยมมาก!',
        oops: 'พลาดไปนิด!',
        allSorted: 'คัดแยกทั้งหมดแล้ว!',
        noTrashCollected: 'ไม่ได้เก็บขยะเลย!',
        noTrashDesc: 'มาลองใหม่อีกครั้งในรอบหน้านะ',
        backToHarbor: 'กลับไปที่ท่าเรือ',
        results: 'ผลลัพธ์',
        finalScore: 'คะแนนสุดท้าย',
        correctlySorted: 'คัดแยกถูกต้อง',
        incorrectlySorted: 'คัดแยกไม่ถูกต้อง',
        rewards: 'รางวัล!',
        coinsEarned: 'เหรียญที่ได้รับ',
        xpGained: 'XP ที่ได้รับ',
        saveError: 'บันทึกความคืบหน้าไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อแล้วลองอีกครั้ง',
        retry: 'ลองอีกครั้ง',
        continue: 'ไปต่อ',
        initializing: 'กำลังเริ่มต้น...',
        dailyRewards: 'รางวัลประจำวัน',
        quests: 'ภารกิจ',
        day: 'วันที่',
        claim: 'รับ',
        claiming: 'กำลังรับ...',
        claimed: 'รับแล้ว',
        dailyQuests: 'ภารกิจรายวัน',
        weeklyContracts: 'สัญญารายสัปดาห์',
        questCollect: 'เก็บขยะประเภท {type} {target} ชิ้น',
        questScore: 'ทำคะแนนให้ได้ {target} ในการเล่นหนึ่งครั้ง',
        questSort: 'คัดแยกขยะให้ถูกต้อง {target} ชิ้นในครั้งเดียว',
        upgradeCore: 'แกนอัปเกรด',
        coralFragment: 'ชิ้นส่วนปะการัง',
        questComplete: 'ทำภารกิจสำเร็จ!',
        upgradeBoatCapacity: 'ความจุเรือ',
        upgradeHookSpeed: 'ความเร็วตะขอ',
        upgradeDescCapacity: 'เพิ่มจำนวนขยะที่สามารถบรรทุกได้',
        upgradeDescHookSpeed: 'ปล่อยและดึงตะขอได้เร็วขึ้น',
        upgrade: 'อัปเกรด',
        cost: 'ราคา',
        maxLevel: 'เลเวลสูงสุด',
        notEnoughResources: 'ทรัพยากรไม่เพียงพอ!',
        noDailyQuests: 'ไม่มีภารกิจรายวัน กลับมาดูใหม่วันพรุ่งนี้!',
        noWeeklyContract: 'ไม่มีสัญญารายสัปดาห์ กลับมาดูใหม่สัปดาห์หน้า!',
        loginRequired: 'จำเป็นต้องเข้าสู่ระบบ',
        loginPromptMessage: 'กรุณาเข้าสู่ระบบเพื่อเข้าถึงฟีเจอร์เหล่านี้!',
        researchAndDev: 'ศูนย์วิจัย',
        market: 'ตลาดนัด',
        coralReef: 'ฟื้นฟูแนวปะการัง',
        research: 'วิจัย',
        startResearch: 'เริ่มวิจัย',
        inProgress: 'กำลังดำเนินการ',
        complete: 'เสร็จสิ้น',
        researchTime: 'เวลา: {hours} ชม.',
        marketOrders: 'ใบสั่งซื้อ',
        craft: 'คราฟต์',
        notEnoughItems: 'ไอเทมไม่เพียงพอ!',
        orderRefreshesIn: 'คำสั่งซื้อใหม่ใน: {time}',
        boatCustomization: 'ปรับแต่งเรือ',
        boatColor: 'สีเรือ',
        flag: 'ธง',
        mapPieces: 'ชิ้นส่วนแผนที่',
        contribute: 'บริจาค',
        reefRestoration: 'การฟื้นฟูแนวปะการัง',
        restorationProgress: 'ความคืบหน้า: {progress}%',
        endlessAbyss: 'ห้วงลึกไร้สิ้นสุด',
        comingSoon: 'เร็วๆ นี้',
        trash_1_name: 'แกนแอปเปิ้ล',
        trash_1_feedback: 'เศษผลไม้เป็นขยะอินทรีย์และสามารถนำไปทำปุ๋ยหมักได้!',
        trash_2_name: 'ขวดพลาสติก',
        trash_2_feedback: 'ขวดพลาสติกที่สะอาดเหมาะสำหรับการรีไซเคิล',
        trash_3_name: 'ถุงขนม',
        trash_3_feedback: 'ถุงขนมที่มีคราบมันควรทิ้งในขยะทั่วไป',
        trash_4_name: 'แบตเตอรี่',
        trash_4_feedback: 'แบตเตอรี่มีสารเคมีอันตรายและต้องกำจัดอย่างปลอดภัย',
        trash_5_name: 'ก้างปลา',
        trash_5_feedback: 'เช่นเดียวกับเศษอาหารอื่นๆ ก้างปลาเป็นขยะอินทรีย์',
        trash_6_name: 'หนังสือพิมพ์',
        trash_6_feedback: 'กระดาษและกระดาษแข็งสามารถรีไซเคิลได้ดีมาก',
        trash_7_name: 'แก้วโฟม',
        trash_7_feedback: 'โฟมที่สกปรกไม่สามารถรีไซเคิลได้และควรทิ้งในขยะทั่วไป',
        trash_8_name: 'หลอดไฟ',
        trash_8_feedback: 'หลอดไฟเก่า โดยเฉพาะหลอดฟลูออเรสเซนต์ เป็นขยะอันตราย',
        trash_9_name: 'เปลือกกล้วย',
        trash_9_feedback: 'เปลือกกล้วยเหมาะสำหรับทำปุ๋ยหมัก!',
        trash_10_name: 'กระป๋องอลูมิเนียม',
        trash_10_feedback: 'รีไซเคิลกระป๋องอลูมิเนียมเพื่อประหยัดพลังงานได้มาก',
        trash_11_name: 'ถุงพลาสติก',
        trash_11_feedback: 'ถุงพลาสติกอาจเป็นอันตรายต่อสัตว์ป่าและควรทิ้งในขยะทั่วไป',
        trash_12_name: 'กระป๋องสี',
        trash_12_feedback: 'สีเก่าถือเป็นขยะอันตราย',
        trash_13_name: 'ข้อความในขวดแก้ว',
        trash_13_feedback: 'ชิ้นส่วนของแผนที่เก่า! มันจะนำไปสู่อะไรกันนะ?',
    }
};

type TranslationKeys = keyof typeof translations.en;
type Language = 'en' | 'th';

const getT = (language: Language) => (key: TranslationKeys) => {
    return translations[language][key] || translations['en'][key];
};

// --- GAME DATA & TYPES ---
type TrashType = 'organic' | 'recyclable' | 'general' | 'hazardous';
type QuestType = 'collect' | 'score' | 'sort';
type RewardType = 'coins' | 'xp' | 'upgradeCore' | 'coralFragment';

interface TrashItemData {
  id: number;
  name: string;
  type: TrashType | 'collectible';
  feedback: string;
  icon: string;
  rarity?: 'common' | 'rare' | 'legendary';
}

const allTrashItemsRawData: (Omit<TrashItemData, 'name' | 'feedback'> & { nameKey: TranslationKeys, feedbackKey: TranslationKeys })[] = [
    { id: 1, nameKey: 'trash_1_name', type: 'organic', feedbackKey: 'trash_1_feedback', icon: '🍎', rarity: 'common' },
    { id: 2, nameKey: 'trash_2_name', type: 'recyclable', feedbackKey: 'trash_2_feedback', icon: '🍾', rarity: 'common' },
    { id: 3, nameKey: 'trash_3_name', type: 'general', feedbackKey: 'trash_3_feedback', icon: '🛍️', rarity: 'common' },
    { id: 4, nameKey: 'trash_4_name', type: 'hazardous', feedbackKey: 'trash_4_feedback', icon: '🔋', rarity: 'rare' },
    { id: 5, nameKey: 'trash_5_name', type: 'organic', feedbackKey: 'trash_5_feedback', icon: '🐟', rarity: 'common' },
    { id: 6, nameKey: 'trash_6_name', type: 'recyclable', feedbackKey: 'trash_6_feedback', icon: '📰', rarity: 'common'},
    { id: 7, nameKey: 'trash_7_name', type: 'general', feedbackKey: 'trash_7_feedback', icon: '☕', rarity: 'common' },
    { id: 8, nameKey: 'trash_8_name', type: 'hazardous', feedbackKey: 'trash_8_feedback', icon: '💡', rarity: 'rare' },
    { id: 9, nameKey: 'trash_9_name', type: 'organic', feedbackKey: 'trash_9_feedback', icon: '🍌', rarity: 'common' },
    { id: 10, nameKey: 'trash_10_name', type: 'recyclable', feedbackKey: 'trash_10_feedback', icon: '🥫', rarity: 'common' },
    { id: 11, nameKey: 'trash_11_name', type: 'general', feedbackKey: 'trash_11_feedback', icon: 'plastic_bag', rarity: 'common' },
    { id: 12, nameKey: 'trash_12_name', type: 'hazardous', feedbackKey: 'trash_12_feedback', icon: '🎨', rarity: 'legendary' },
    { id: 13, nameKey: 'trash_13_name', type: 'collectible', feedbackKey: 'trash_13_feedback', icon: '🍾📜', rarity: 'legendary' },
];

const getLocalizedTrashItems = (t: (key: TranslationKeys) => string): TrashItemData[] => {
    return allTrashItemsRawData.map(item => ({
        id: item.id,
        name: t(item.nameKey),
        type: item.type,
        feedback: t(item.feedbackKey),
        icon: item.icon,
        rarity: item.rarity || 'common',
    }));
};


interface UnderwaterTrashItem extends TrashItemData {
    x: number;
    y: number;
    vx: number;
    vy: number;
}
interface QuestReward {
    type: RewardType;
    amount: number;
}
interface Quest {
    id: string;
    type: QuestType;
    target: number;
    progress: number;
    trashType?: TrashType;
    reward: QuestReward;
    claimed: boolean;
}

interface PlayerUpgrades {
    capacity: number; // Level
    hookSpeed: number; // Level
}

interface PlayerResearch {
    [key: string]: {
        level: number;
        researchCompleteTime: Timestamp | null;
    }
}

interface PlayerCustomization {
    boatColor: string;
    flag: string;
}

interface PlayerData {
    id?: string;
    level: number;
    xp: number;
    coins: number;
    displayName: string;
    photoURL: string;
    totalScore: number;
    weeklyScore: number;
    lastWeeklyUpdate: number; // Timestamp
    lastLoginClaim: Timestamp | null;
    loginStreak: number;
    upgradeCores: number;
    coralFragments: number;
    dailyQuests: Quest[];
    weeklyContract: Quest | null;
    lastDailyQuestRefresh: Timestamp | null;
    lastWeeklyContractRefresh: Timestamp | null;
    upgrades: PlayerUpgrades;
    research: PlayerResearch;
    customization: PlayerCustomization;
    inventory: { [key in TrashType]: number };
    marketOrder: MarketOrder | null;
    lastMarketOrderRefresh: Timestamp | null;
    collectibles: { mapPieces: number };
    coralReefProgress: number;
}

interface GameResult {
    score: number;
    correct: number;
    incorrect: number;
    sortedCounts: { [key in TrashType]: number };
    collectedMapPieces: number;
}

type GlobalStats = {
    totalItems: number;
} & Record<TrashType, number>;


interface ResearchData {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    costs: { cores: number, durationHours: number }[];
}


interface MarketOrder {
    id: string;
    required: { [key in TrashType]?: number };
    reward: { type: 'coins' | 'upgradeCore' | 'coralFragment', amount: number };
}




const trashIcons: { [key: string]: string } = {
    '🍎': '🍎', '🍾': '🍾', '🛍️': '🛍️', '🔋': '🔋', '🐟': '🐟', '📰': '📰', '☕': '☕', '💡': '💡', '🍌': '🍌', '🥫': '🥫', '🎨': '🎨', '🍾📜': '🍾📜',
    'plastic_bag': '👜', 
};

const DAILY_REWARDS: {type: 'coins' | 'upgradeCore', amount: number}[] = [
    {type: 'coins', amount: 50}, {type: 'coins', amount: 75}, {type: 'coins', amount: 100}, {type: 'coins', amount: 125},
    {type: 'coins', amount: 150}, {type: 'coins', amount: 200}, {type: 'upgradeCore', amount: 1}, {type: 'coins', amount: 225},
    {type: 'coins', amount: 250}, {type: 'coins', amount: 275}, {type: 'coins', amount: 300}, {type: 'coins', amount: 350},
    {type: 'coins', amount: 400}, {type: 'upgradeCore', amount: 1}, {type: 'coins', amount: 425}, {type: 'coins', amount: 450},
    {type: 'coins', amount: 475}, {type: 'coins', amount: 500}, {type: 'coins', amount: 550}, {type: 'coins', amount: 600},
    {type: 'upgradeCore', amount: 2}, {type: 'coins', amount: 650}, {type: 'coins', amount: 700}, {type: 'coins', amount: 750},
    {type: 'coins', amount: 800}, {type: 'coins', amount: 900}, {type: 'coins', amount: 1000}, {type: 'upgradeCore', amount: 3},
];

const UPGRADE_COSTS = {
    capacity: [
        { coins: 200, cores: 0 }, { coins: 500, cores: 1 }, { coins: 1000, cores: 1 }, { coins: 2000, cores: 2 }, 
        { coins: 3500, cores: 2 }, { coins: 5000, cores: 3 }, { coins: 7500, cores: 4 }, { coins: 10000, cores: 5 }, { coins: 15000, cores: 6 }
    ],
    hookSpeed: [
        { coins: 300, cores: 0 }, { coins: 600, cores: 1 }, { coins: 1200, cores: 1 }, { coins: 2500, cores: 2 }, { coins: 5000, cores: 3 }
    ]
};
const MAX_LEVEL_CAPACITY = UPGRADE_COSTS.capacity.length + 1;
const MAX_LEVEL_HOOK_SPEED = UPGRADE_COSTS.hookSpeed.length + 1;

const allQuestsPool: Omit<Quest, 'id'|'progress'|'claimed'>[] = [
    // Collect
    { type: 'collect', trashType: 'organic', target: 5, reward: { type: 'coins', amount: 50 } },
    { type: 'collect', trashType: 'recyclable', target: 5, reward: { type: 'coins', amount: 50 } },
    { type: 'collect', trashType: 'general', target: 5, reward: { type: 'coins', amount: 75 } },
    { type: 'collect', trashType: 'hazardous', target: 3, reward: { type: 'coins', amount: 100 } },
    { type: 'collect', trashType: 'organic', target: 10, reward: { type: 'coins', amount: 120 } },
    { type: 'collect', trashType: 'recyclable', target: 10, reward: { type: 'coins', amount: 120 } },
    // Sort
    { type: 'sort', target: 10, reward: { type: 'coins', amount: 100 } },
    { type: 'sort', target: 15, reward: { type: 'coins', amount: 150 } },
    { type: 'sort', target: 20, reward: { type: 'coins', amount: 250 } },
    // Score
    { type: 'score', target: 1000, reward: { type: 'xp', amount: 100 } },
    { type: 'score', target: 1500, reward: { type: 'xp', amount: 150 } },
    { type: 'score', target: 2000, reward: { type: 'coins', amount: 200 } },
];
const allContractsPool: Omit<Quest, 'id'|'progress'|'claimed'>[] = [
    { type: 'collect', trashType: 'recyclable', target: 50, reward: { type: 'upgradeCore', amount: 1 } },
    { type: 'sort', target: 100, reward: { type: 'upgradeCore', amount: 1 } },
    { type: 'score', target: 10000, reward: { type: 'coins', amount: 1500 } },
    { type: 'collect', trashType: 'hazardous', target: 20, reward: { type: 'upgradeCore', amount: 2 } },
];

const RESEARCH_DATA: ResearchData[] = [
    { id: 'sonar', name: 'Advanced Sonar', description: 'Occasionally highlights rare trash.', maxLevel: 3, costs: [{cores: 1, durationHours: 4}, {cores: 2, durationHours: 8}, {cores: 3, durationHours: 12}]},
    { id: 'net', name: 'Reinforced Net', description: 'Chance to catch a second, smaller trash item.', maxLevel: 3, costs: [{cores: 1, durationHours: 2}, {cores: 2, durationHours: 6}, {cores: 3, durationHours: 10}]},
];

const BOAT_COLORS = ['#8b4513', '#d2b48c', '#607d8b', '#009688', '#e91e63', '#3f51b5'];
const BOAT_FLAGS = ['🏴‍☠️', '🚩', '🏳️‍🌈', '🌊', '♻️', '🐠'];

const MARKET_ORDER_POOL: Omit<MarketOrder, 'id'>[] = [
    { required: { recyclable: 10, organic: 5 }, reward: { type: 'coins', amount: 250 } },
    { required: { general: 15 }, reward: { type: 'coins', amount: 300 } },
    { required: { hazardous: 5 }, reward: { type: 'coralFragment', amount: 1 } },
    { required: { organic: 25 }, reward: { type: 'coins', amount: 200 } },
    { required: { recyclable: 20, general: 10 }, reward: { type: 'upgradeCore', amount: 1 } },
];

const canClaimDailyRewardCheck = (playerData: PlayerData | null): boolean => {
    if (!playerData) return false;
    const streak = playerData.loginStreak || 0;
    if (streak >= DAILY_REWARDS.length) return false;
    if (!playerData.lastLoginClaim) return true;
    const lastClaimDate = playerData.lastLoginClaim.toDate();
    const today = new Date();
    return lastClaimDate.getFullYear() !== today.getFullYear() ||
           lastClaimDate.getMonth() !== today.getMonth() ||
           lastClaimDate.getDate() !== today.getDate();
};


// --- REUSABLE UI COMPONENTS ---

interface GameButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

const GameButton: FC<GameButtonProps> = ({ onClick, children, className = '', disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                mossy-stone-button w-full font-display tracking-wider uppercase rounded-full
                text-cyan-50 shadow-lg shadow-black/40
                transform transition-all duration-300 ease-in-out
                hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
                flex items-center justify-center px-4 py-3
                ${className}
            `}
        >
            <span className="relative z-10 flex items-center">
                {children}
            </span>
        </button>
    );
};

const LanguageSwitcher: FC<{ language: Language, toggleLanguage: () => void, className?: string }> = ({ language, toggleLanguage, className }) => {
    return (
        <button onClick={toggleLanguage} className={`language-switcher ${className}`}>
            <span className={language === 'en' ? 'active' : ''}>EN</span>
            <span>/</span>
            <span className={language === 'th' ? 'active' : ''}>ไทย</span>
        </button>
    );
};


// --- BACKGROUND & EFFECTS ---
const AnimatedBackground: FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const elements: HTMLElement[] = [];
        const createAndAppend = (tag: string, className: string) => {
            const el = document.createElement(tag);
            el.className = className;
            container.appendChild(el);
            elements.push(el);
            return el;
        };
        
        for (let i = 0; i < 5; i++) {
            const ray = createAndAppend('div', 'god-ray');
            gsap.set(ray, { x: (width * 0.1) + (Math.random() * width * 0.8), rotation: -10 + Math.random() * 20 });
            gsap.fromTo(ray, { opacity: 0 }, { opacity: 0.8 + Math.random() * 0.2, duration: 4 + Math.random() * 3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 4 });
        }
        
        for (let i = 0; i < 50; i++) {
            const p = createAndAppend('div', 'particle');
            const size = 1 + Math.random() * 2;
            gsap.set(p, { x: Math.random() * width, y: Math.random() * height, width: size, height: size, opacity: Math.random() * 0.5 });
            gsap.to(p, { y: '-=100', opacity: 0, duration: 10 + Math.random() * 10, repeat: -1, ease: 'none', modifiers: { y: y => `${parseFloat(y) % height}px` } });
        }

        return () => { elements.forEach(el => el.remove()); };
    }, []);

    return <div ref={containerRef} className="background-container" />;
};


// --- SCREENS & MODALS ---

const OctopusLoader: FC = () => (
    <svg className="octopus-loader" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="goo" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
                <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
                <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
            </filter>
        </defs>
        <g style={{ filter: 'url(#goo)' }}>
            {/* Body */}
            <path d="M100 50 C 70 50, 70 90, 100 90 S 130 50, 100 50 Z" fill="#8A2BE2"/>
            <circle cx="90" cy="70" r="5" fill="white" />
            <circle cx="110" cy="70" r="5" fill="white" />
            <circle cx="90" cy="70" r="2" fill="black" />
            <circle cx="110" cy="70" r="2" fill="black" />

            {/* Tentacles */}
            <g fill="#8A2BE2">
                <path d="M100,85 C 90,95 80,115 70,125" stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"/>
                <path d="M100,85 C 110,95 120,115 130,125" stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"/>
                <path d="M90,88 C 80,105 75,130 85,140" stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"/>
                <path d="M110,88 C 120,105 125,130 115,140" stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"/>
                
                {/* Animated Tentacle */}
                <g id="tentacle-collect">
                    <path d="M80,88 C 60,100 50,120 40,110" stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"/>
                </g>
                <path d="M120,88 C 140,100 150,120 160,110" stroke="#8A2BE2" strokeWidth="10" fill="none" strokeLinecap="round"/>
            </g>
        </g>
        
        {/* Trash */}
        <g id="trash-group" transform="translate(10, 115)">
            <rect x="0" y="0" width="10" height="15" fill="#654321" transform="rotate(-15)"/>
            <circle cx="15" cy="5" r="5" fill="#3A5FCD"/>
        </g>
    </svg>
);

const LoadingScreen: FC<{ message: string }> = ({ message }) => {
    const ecoFacts = [
        "Over 8 million tons of plastic enter the oceans each year.",
        "Recycling one aluminum can saves enough energy to run a TV for 3 hours.",
        "The Great Pacific Garbage Patch is twice the size of Texas.",
        "By 2050, there could be more plastic in the ocean than fish by weight.",
        "A single plastic bottle can take 450 years to decompose.",
    ];
    const [fact, setFact] = useState(() => ecoFacts[Math.floor(Math.random() * ecoFacts.length)]);
    const factRef = useRef<HTMLParagraphElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.to(progressBarRef.current, { width: '100%', duration: 2.5, ease: 'power2.out' });
        
        const interval = setInterval(() => {
            gsap.to(factRef.current, {
                opacity: 0, duration: 0.5, onComplete: () => {
                    setFact(prevFact => {
                        let newFact = prevFact;
                        while (newFact === prevFact) {
                             newFact = ecoFacts[Math.floor(Math.random() * ecoFacts.length)];
                        }
                        return newFact;
                    });
                    gsap.to(factRef.current, { opacity: 1, duration: 0.5, delay: 0.1 });
                }
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <OctopusLoader />
            <h2 className="font-display text-4xl dirty-crystal-text mt-4 mb-6">{message}</h2>
            <div className="w-full max-w-md">
                 <p ref={factRef} className="eco-fact text-lg text-cyan-200 h-12 flex items-center justify-center">{fact}</p>
            </div>
            <div className="loading-progress-container">
                <div ref={progressBarRef} className="loading-progress-bar"></div>
            </div>
        </div>
    );
};

const TitleScreen: FC<{ onPlayGuest: () => void; onLogin: () => void; t: (key: TranslationKeys) => string; language: Language; toggleLanguage: () => void; }> = ({ onPlayGuest, onLogin, t, language, toggleLanguage }) => {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const playBtnRef = useRef(null);
    const loginBtnRef = useRef(null);
    const titleText = "Cleanwater Quest";

    useLayoutEffect(() => {
        const titleEl = titleRef.current;
        if (!titleEl) return;
        const letterSpans = titleEl.querySelectorAll('span');

        gsap.from(letterSpans, { y: -100, opacity: 0, duration: 0.8, ease: 'bounce.out', stagger: 0.05 });
        gsap.from([playBtnRef.current, loginBtnRef.current], { scale: 0, opacity: 0, duration: 0.5, stagger: 0.2, ease: 'back.out(1.7)', delay: 0.5 });
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 relative">
            <LanguageSwitcher language={language} toggleLanguage={toggleLanguage} className="absolute top-4 right-4" />
            <h1 ref={titleRef} className="font-display text-6xl sm:text-7xl md:text-9xl dirty-crystal-text mb-16">
                 {titleText.split('').map((char, index) => <span key={index}>{char === ' ' ? '\u00A0' : char}</span>)}
            </h1>
            <div className="w-full max-w-xs px-4 space-y-4 md:space-y-6">
                <div ref={playBtnRef}><GameButton onClick={onPlayGuest} className="text-3xl md:text-4xl py-2">{t('play')}</GameButton></div>
                <div ref={loginBtnRef}>
                     <GameButton onClick={onLogin} className="text-lg md:text-xl">
                        <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.032,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        {t('signInWithGoogle')}
                    </GameButton>
                </div>
            </div>
        </div>
    );
};

const ProfileModal: FC<{ user: User; onSave: (updatedUser: User) => void; onClose: () => void; isEditing: boolean; t: (key: TranslationKeys) => string; onShowCustomization: () => void; }> = ({ user, onSave, onClose, isEditing, t, onShowCustomization }) => {
    const [displayName, setDisplayName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('🐙');
    const [isSaving, setIsSaving] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    const avatars = ['🐙', '🐠', '🦀', '🐬', '🐢', '🐡', '🦑', '🐋', '🦈', '🐚', '🌊', '⚓️', '💎', '⭐', '☀️', '⛵️'];

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
            setSelectedAvatar(user.photoURL || '🐙');
        }
    }, [user]);

    useLayoutEffect(() => {
        gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
    }, []);

    const handleSave = async () => {
        if (!auth.currentUser) return;
        if (!displayName.trim()) {
            alert(t('nameRequiredError'));
            return;
        }
        setIsSaving(true);
        try {
            await updateProfile(auth.currentUser, { displayName, photoURL: selectedAvatar });
            const playerDocRef = doc(db, "players", auth.currentUser.uid);
            await setDoc(playerDocRef, { displayName, photoURL: selectedAvatar }, { merge: true });
            onSave(auth.currentUser);

        } catch (error) {
            console.error("Failed to update profile:", error);
            alert(t('profileSaveError'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div ref={modalRef} className="profile-modal-popup bg-cyan-900/80 border-2 border-cyan-400/50 rounded-2xl p-8 w-full max-w-lg text-center shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{isEditing ? t('editProfile') : t('createProfile')}</h2>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="avatar-container">
                         <div className="avatar-display">
                            {selectedAvatar}
                         </div>
                    </div>
                    <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t('enterYourName')}
                        className="w-full max-w-xs p-3 text-xl text-center bg-black/20 border-2 border-cyan-400/50 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                    />
                </div>

                <div className="mb-8">
                    <h3 className="text-xl text-cyan-200 mb-3">{t('chooseAvatar')}</h3>
                    <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
                        {avatars.map(avatar => (
                            <button key={avatar} onClick={() => setSelectedAvatar(avatar)} className={`aspect-square text-4xl rounded-full transition-all duration-200 ${selectedAvatar === avatar ? 'bg-cyan-400 scale-110 ring-2 ring-white' : 'bg-black/20 hover:bg-black/40'}`}>
                                {avatar}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <GameButton onClick={onShowCustomization}>{t('boatCustomization')}</GameButton>
                    <GameButton onClick={handleSave} disabled={isSaving} className="text-2xl game-button-primary">
                        {isSaving ? t('saving') : (isEditing ? t('saveChanges') : t('startAdventure'))}
                    </GameButton>
                </div>
            </div>
        </div>
    );
};


const LeaderboardModal: FC<{ onClose: () => void; t: (key: TranslationKeys) => string; }> = ({ onClose, t }) => {
    const [activeTab, setActiveTab] = useState<'weekly' | 'all-time'>('weekly');
    const [leaderboardData, setLeaderboardData] = useState<PlayerData[]>([]);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const playersCol = collection(db, 'players');
                const q = query(
                    playersCol,
                    orderBy(activeTab === 'weekly' ? 'weeklyScore' : 'totalScore', 'desc'),
                    limit(10)
                );
                const querySnapshot = await getDocs(q);
                const players = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as PlayerData);
                setLeaderboardData(players);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
                alert(t('leaderboardLoadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [activeTab, t]);

    useLayoutEffect(() => {
        gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });
    }, []);

    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="leaderboard-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{t('leaderboard')}</h2>
                
                <div className="leaderboard-tabs">
                    <button onClick={() => setActiveTab('weekly')} className={activeTab === 'weekly' ? 'active' : ''}>{t('weekly')}</button>
                    <button onClick={() => setActiveTab('all-time')} className={activeTab === 'all-time' ? 'active' : ''}>{t('allTime')}</button>
                </div>

                {activeTab === 'weekly' && (
                    <p className="leaderboard-prize">{t('weeklyPrize')}</p>
                )}

                <div className="leaderboard-list">
                    {loading ? (
                        <p className="text-center p-8">{t('loadingRankings')}</p>
                    ) : leaderboardData.length === 0 ? (
                        <p className="text-center p-8">{t('noScoresYet')}</p>
                    ) : (
                        leaderboardData.map((player, index) => (
                            <div key={player.id || index} className="leaderboard-item">
                                <div className="leaderboard-rank">{index + 1}</div>
                                <div className="leaderboard-player">
                                    <div className="leaderboard-avatar">{player.photoURL}</div>
                                    <span>{player.displayName}</span>
                                </div>
                                <div className="leaderboard-score">{activeTab === 'weekly' ? player.weeklyScore : player.totalScore}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const HarborScreen: FC<{ 
    user: User | null; 
    isGuest: boolean; 
    playerData: PlayerData | null; 
    globalStats: GlobalStats | null;
    onLogout: () => void; 
    onStartGame: () => void; 
    onEditProfile: () => void; 
    onShowLeaderboard: () => void;
    onShowDailyRewards: () => void;
    onShowQuests: () => void;
    onShowUpgrades: () => void;
    onShowResearch: () => void;
    onShowMarket: () => void;
    onShowCoralReef: () => void;
    onShowLoginPrompt: () => void;
    t: (key: TranslationKeys) => string;
    language: Language;
    toggleLanguage: () => void;
}> = ({ user, isGuest, playerData, globalStats, onLogout, onStartGame, onEditProfile, onShowLeaderboard, onShowDailyRewards, onShowQuests, onShowUpgrades, onShowResearch, onShowMarket, onShowCoralReef, onShowLoginPrompt, t, language, toggleLanguage }) => {
    const welcomeRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        gsap.from(welcomeRef.current, { opacity: 0, y: 50, duration: 0.5, ease: 'back.out(1.7)' });
    }, []);

    const displayName = isGuest ? t('guest') : playerData?.displayName || t('adventurer');
    const photoURL = isGuest ? playerData?.photoURL : playerData?.photoURL;
    const isEmojiAvatar = photoURL && !photoURL.startsWith('http');

    const level = !playerData ? 1 : playerData.level;
    const xp = !playerData ? 0 : playerData.xp;
    const coins = !playerData ? 0 : playerData.coins;
    const xpForNextLevel = !playerData ? 500 : level * 500;
    const xpPercentage = Math.min((xp / xpForNextLevel) * 100, 100);

    const statIcons: { [key in TrashType]: string } = {
        organic: '🌿',
        recyclable: '♻️',
        general: '🗑️',
        hazardous: '☣️',
    };
    
    const canClaim = canClaimDailyRewardCheck(playerData);

    const hasClaimableQuests = playerData && (
        (playerData.dailyQuests || []).some(q => !q.claimed && q.progress >= q.target) ||
        (playerData.weeklyContract && !playerData.weeklyContract.claimed && playerData.weeklyContract.progress >= playerData.weeklyContract.target)
    );

    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-30">
              {!isGuest && (
                   <button onClick={onEditProfile} className="edit-profile-button" aria-label={t('editProfile')}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                  </button>
              )}
               <LanguageSwitcher language={language} toggleLanguage={toggleLanguage} />
            </div>
            <div ref={welcomeRef} className="text-center flex flex-col items-center justify-center h-full p-4">
                <div className="w-full max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-cyan-300/50 shadow-lg bg-cyan-800/50 flex items-center justify-center overflow-hidden">
                            {isEmojiAvatar ? (
                                <span className="text-5xl">{photoURL}</span>
                            ) : (
                                <img src={photoURL} alt="User avatar" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="ml-4 text-left">
                            <h2 className="font-display text-4xl dirty-crystal-text">{displayName}</h2>
                            <p className="text-sm">
                                <span>💰 {coins} | 💎 {playerData?.upgradeCores || 0}</span>
                                <span className="ml-2">Fragments: {playerData?.coralFragments || 0}</span>
                                <span className="ml-4">📜 {playerData?.collectibles.mapPieces || 0}</span>
                            </p>
                        </div>
                    </div>

                    <div className="stats-panel bg-black/20 p-4 rounded-xl mb-8">
                        <div className="text-left text-lg mb-2">{t('level')} {level}</div>
                        <div className="w-full bg-gray-700/80 rounded-full h-5 border border-gray-500/50">
                            <div className="xp-bar h-full rounded-full" style={{ width: `${xpPercentage}%` }}></div>
                        </div>
                        <div className="text-right text-sm mt-1">{xp} / {xpForNextLevel} XP</div>
                    </div>

                    <div className="space-y-4">
                        <GameButton onClick={onStartGame} className="text-3xl py-3 game-button-primary">{t('setSail')}</GameButton>
                        <div className="grid grid-cols-3 gap-4">
                             <GameButton onClick={isGuest ? onShowLoginPrompt : onShowDailyRewards} className={`engagement-button text-sm ${canClaim ? 'glow' : ''}`}>{t('dailyRewards')}</GameButton>
                            <GameButton onClick={isGuest ? onShowLoginPrompt : onShowQuests} className={`engagement-button text-sm ${hasClaimableQuests ? 'glow' : ''}`}>{t('quests')}</GameButton>
                            <GameButton onClick={isGuest ? onShowLoginPrompt : onShowUpgrades} className="text-sm">{t('upgrades')}</GameButton>
                        </div>
                         <div className="grid grid-cols-3 gap-4">
                            <GameButton onClick={isGuest ? onShowLoginPrompt : onShowResearch} className="text-sm">{t('researchAndDev')}</GameButton>
                            <GameButton onClick={isGuest ? onShowLoginPrompt : onShowMarket} className="text-sm">{t('market')}</GameButton>
                            <GameButton onClick={isGuest ? onShowLoginPrompt : onShowCoralReef} className="text-sm">{t('coralReef')}</GameButton>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <GameButton onClick={onShowLeaderboard}>{t('leaderboard')}</GameButton>
                             <GameButton onClick={onLogout} className="text-lg bg-red-800/50">{isGuest ? t('backToTitle') : t('logout')}</GameButton>
                         </div>
                    </div>

                    {globalStats && (
                        <div className="global-cleanup-panel">
                            <h3 className="global-cleanup-title">{t('globalCleanupEffort')}</h3>
                            <div className="global-stats-total">
                                <p className="text-sm text-cyan-200">{t('totalItemsCollected')}</p>
                                <span>{globalStats.totalItems.toLocaleString()}</span>
                            </div>
                            <div className="global-stats-breakdown">
                                {(Object.keys(statIcons) as TrashType[]).map(type => (
                                    <div key={type} className="stat-item">
                                        <span className="stat-icon">{statIcons[type]}</span>
                                        <span className="font-bold">{globalStats[type]?.toLocaleString() || 0}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- NEW TRASH COLLECTING MINIGAME ---
const WaterSurface: FC<{ waterLevel: number }> = ({ waterLevel }) => (
    <div className="water-surface" style={{ top: `${waterLevel}px` }}>
        <div className="water-shimmer"></div>
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
            <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="parallax">
                <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(30,58,138,0.7)" />
                <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(30,58,138,0.5)" />
                <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(30,58,138,0.3)" />
                <use xlinkHref="#gentle-wave" x="48" y="7" fill="#1e3a8a" />
            </g>
        </svg>
    </div>
);

const UnderwaterScenery: FC<{ worldWidth: number, waterLevel: number }> = React.memo(({ worldWidth, waterLevel }) => {
    const scenery = useRef<React.ReactElement[]>([]);
    
    if (scenery.current.length === 0) {
        // Rocks
        for (let i = 0; i < worldWidth / 150; i++) {
            const size = 50 + Math.random() * 150;
            const style = {
                width: size,
                height: size * (0.4 + Math.random() * 0.4),
                left: Math.random() * worldWidth,
                zIndex: 1,
                opacity: 0.3 + Math.random() * 0.4
            };
            scenery.current.push(<div key={`rock-${i}`} className="rock" style={style}></div>);
        }
        // Flora
        for (let i = 0; i < worldWidth / 50; i++) {
            const h = 40 + Math.random() * 120;
            const w = 10 + Math.random() * 20;
            const color = `hsl(${80 + Math.random() * 60}, 70%, 50%)`;
            const x = Math.random() * worldWidth;
            const style = { height: h, width: w, backgroundColor: color, left: x };
            const animStyle = { animationDelay: `${Math.random() * 4}s`, animationDuration: `${4 + Math.random() * 3}s` };
            scenery.current.push(<div key={`flora-${i}`} className={Math.random() > 0.3 ? 'coral' : 'seaweed'} style={{...style, ...animStyle}}></div>);
        }
    }

    return <>{scenery.current}</>;
});


const TrashCollectingGame: FC<{ onCollectionEnd: (collectedItems: TrashItemData[]) => void; allTrashItems: TrashItemData[]; t: (key: TranslationKeys) => string; playerData: PlayerData | null; }> = ({ onCollectionEnd, allTrashItems, t, playerData }) => {
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const gameWorldRef = useRef<HTMLDivElement>(null);
    const boatRef = useRef<HTMLDivElement>(null);
    const hookRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<SVGLineElement>(null);
    const lineAnchorRef = useRef<HTMLDivElement>(null);
    const depositedTrashRef = useRef<HTMLDivElement>(null);

    const viewportWidth = window.innerWidth;
    const worldWidth = viewportWidth * 2;
    const waterLevel = window.innerHeight * 0.3;

    const [cameraX, setCameraX] = useState(worldWidth / 4);
    const [boatPos, setBoatPos] = useState({ x: worldWidth / 2, y: waterLevel, r: 0 });
    const [hookState, setHookState] = useState({ x: worldWidth / 2, y: waterLevel + 10, vx: 0 });

    const [gamePhase, setGamePhase] = useState<'idle' | 'lowering' | 'rising' | 'depositing'>('idle');
    const [underwaterTrash, setUnderwaterTrash] = useState<UnderwaterTrashItem[]>([]);
    const [caughtTrash, setCaughtTrash] = useState<TrashItemData | null>(null);
    const [collectedTrash, setCollectedTrash] = useState<TrashItemData[]>([]);
    const [fishes, setFishes] = useState<{ id: number; x: number; y: number; size: number; speed: number; right: boolean }[]>([]);
    const [isEnding, setIsEnding] = useState(false);
    
    const upgrades = playerData?.upgrades || { capacity: 1, hookSpeed: 1 };
    const customization = playerData?.customization || { boatColor: '#8b4513', flag: '🏴‍☠️' };
    
    const maxCapacity = 10 + ((upgrades?.capacity || 1) - 1) * 2;
    const hookSpeed = 4 + ((upgrades?.hookSpeed || 1) - 1) * 1;
    
    const score = collectedTrash.length * 10;

    // Initialize Trash and Fish
    useEffect(() => {
        const gameHeight = window.innerHeight;
        const getRarityWeight = (rarity: 'common' | 'rare' | 'legendary' | undefined) => {
            if (rarity === 'legendary') return 1;
            if (rarity === 'rare') return 5;
            return 20;
        };

        const weightedTrashPool = allTrashItems.flatMap(item => Array(getRarityWeight(item.rarity)).fill(item));
        
        const newTrash: UnderwaterTrashItem[] = [...Array(30)].map(() => {
            const item = weightedTrashPool[Math.floor(Math.random() * weightedTrashPool.length)];
            return {
                ...item,
                id: Math.random(), // Unique ID for this instance
                x: 50 + Math.random() * (worldWidth - 100),
                y: waterLevel + 150 + Math.random() * (gameHeight - waterLevel - 200),
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
            };
        });
        setUnderwaterTrash(newTrash);

        const newFishes = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: Math.random() * worldWidth,
            y: waterLevel + 150 + Math.random() * (gameHeight - waterLevel - 200),
            size: 20 + Math.random() * 30,
            speed: 1 + Math.random() * 2,
            right: Math.random() > 0.5,
        }));
        setFishes(newFishes);
    }, [worldWidth, waterLevel, allTrashItems]);

    // Game Loop
    useEffect(() => {
        let targetX = boatPos.x;

        const handlePointerMove = (e: PointerEvent) => {
             const pointerX = e.clientX + cameraX;
             targetX = gsap.utils.clamp(viewportWidth * 0.1, worldWidth - viewportWidth * 0.1, pointerX);
        };
        const handlePointerDown = () => { if (gamePhase === 'idle' && collectedTrash.length < maxCapacity) setGamePhase('lowering'); };
        const handlePointerUp = () => { if (gamePhase === 'lowering') setGamePhase('rising'); };
        
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);

        const ticker = (time: number) => {
            // Boat position
            const newBoatX = gsap.utils.interpolate(boatPos.x, targetX, 0.08);
            
            // Camera follow
            const deadZone = viewportWidth * 0.3;
            const boatScreenX = newBoatX - cameraX;
            let newCameraX = cameraX;

            if (boatScreenX < deadZone) {
                newCameraX = gsap.utils.interpolate(cameraX, newBoatX - deadZone, 0.05);
            } else if (boatScreenX > viewportWidth - deadZone) {
                newCameraX = gsap.utils.interpolate(cameraX, newBoatX - (viewportWidth - deadZone), 0.05);
            }
            newCameraX = gsap.utils.clamp(0, worldWidth - viewportWidth, newCameraX);
            setCameraX(newCameraX);

            // Boat physics based on waves
            const wave1 = Math.sin(time * 1.5 + newBoatX * 0.015) * 12;
            const wave2 = Math.sin(time * 2.5 + newBoatX * 0.01) * 8;
            const boatY = waterLevel + wave1 + wave2;

            const waveAngle1 = Math.cos(time * 1.5 + (newBoatX - 15) * 0.015);
            const waveAngle2 = Math.cos(time * 1.5 + (newBoatX + 15) * 0.015);
            const boatAngle = (waveAngle2 - waveAngle1) * 10;
            
            setBoatPos({ x: newBoatX, y: boatY, r: boatAngle });

            // Hook physics & logic
            setHookState(prev => {
                let { x, y, vx } = prev;
                
                const lineAnchor = lineAnchorRef.current?.getBoundingClientRect();
                const anchorX = lineAnchor ? (lineAnchor.x + cameraX + lineAnchor.width / 2) : newBoatX;
                const anchorY = lineAnchor ? (lineAnchor.y + lineAnchor.height / 2) : boatY + 20;

                if (gamePhase === 'lowering') {
                    y += hookSpeed;
                    if (y >= window.innerHeight - 40) setGamePhase('rising');
                } else if (gamePhase === 'rising') {
                    y -= hookSpeed * 1.5;
                    if (y <= anchorY + 10) {
                        y = anchorY + 10;
                        if (caughtTrash) {
                             setGamePhase('depositing');
                        } else if(collectedTrash.length >= maxCapacity && !isEnding) {
                             setIsEnding(true);
                             setTimeout(() => onCollectionEnd(collectedTrash), 500);
                        } else {
                             setGamePhase('idle');
                        }
                    }
                }
                
                let forceX = 0;
                if(gamePhase === 'idle' || gamePhase === 'depositing') {
                    forceX = (anchorX - x) * 0.02;
                } else {
                    forceX = (anchorX - x) * 0.005; 
                }
                vx += forceX;
                vx *= 0.95; // Damping
                x += vx;

                // Collision Detection on rise
                if (gamePhase === 'rising' && !caughtTrash && collectedTrash.length < maxCapacity) {
                    setUnderwaterTrash(prevTrash =>
                        prevTrash.filter(trash => {
                            const distance = Math.sqrt(Math.pow(trash.x - x, 2) + Math.pow(trash.y - y, 2));
                            if (distance < 40) {
                                setCaughtTrash(trash);
                                return false;
                            }
                            return true;
                        })
                    );
                }
                return { x, y, vx };
            });

            setFishes(f => f.map(fish => {
                let newX = fish.x + (fish.right ? fish.speed : -fish.speed);
                if (newX > worldWidth + 50 && fish.right) newX = -50;
                if (newX < -50 && !fish.right) newX = worldWidth + 50;
                return { ...fish, x: newX };
            }));
        };

        gsap.ticker.add(ticker);

        return () => {
            gsap.ticker.remove(ticker);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [gamePhase, onCollectionEnd, caughtTrash, collectedTrash, boatPos.x, cameraX, isEnding, maxCapacity, hookSpeed]);

    useEffect(() => {
         if (gamePhase === 'depositing' && caughtTrash && depositedTrashRef.current) {
            const depositedCopy = depositedTrashRef.current;
            depositedCopy.style.display = 'block';
            depositedCopy.innerText = trashIcons[caughtTrash.icon] || '🗑️';

            const startRect = hookRef.current?.getBoundingClientRect();
            const endRect = boatRef.current?.getBoundingClientRect();

            if (startRect && endRect) {
                gsap.fromTo(depositedCopy, 
                    { x: startRect.left, y: startRect.top, scale: 1 }, 
                    { 
                        x: endRect.left + endRect.width / 2, 
                        y: endRect.top + endRect.height / 3, 
                        scale: 0.2, 
                        duration: 0.6, 
                        ease: 'power2.in',
                        onComplete: () => {
                            depositedCopy.style.display = 'none';
                            const newCollectedTrash = [...collectedTrash, caughtTrash];
                            setCollectedTrash(newCollectedTrash);
                            setCaughtTrash(null);
                             if (newCollectedTrash.length >= maxCapacity && !isEnding) {
                                 setIsEnding(true);
                                 setTimeout(() => onCollectionEnd(newCollectedTrash), 500);
                             } else {
                                setGamePhase('idle');
                             }
                        }
                    }
                );
            }
        }
    }, [gamePhase, caughtTrash, collectedTrash, maxCapacity, onCollectionEnd, isEnding]);

    useLayoutEffect(() => {
        gsap.set(gameWorldRef.current, { x: -cameraX });
        gsap.set(boatRef.current, { x: boatPos.x, y: boatPos.y, rotation: boatPos.r });
        gsap.set(hookRef.current, { x: hookState.x, y: hookState.y });
        
        const lineAnchor = lineAnchorRef.current?.getBoundingClientRect();
        if (lineRef.current && lineAnchor) {
            lineRef.current.setAttribute('x1', (lineAnchor.x + lineAnchor.width / 2).toString());
            lineRef.current.setAttribute('y1', (lineAnchor.y + lineAnchor.height / 2).toString());
            lineRef.current.setAttribute('x2', (hookState.x - cameraX).toString());
            lineRef.current.setAttribute('y2', hookState.y.toString());
        }
    }, [boatPos, hookState, cameraX]);

    return (
        <div ref={gameAreaRef} className="collection-game-container">
            <div className="sky-background">
                <div className="clouds clouds-1"></div>
                <div className="clouds clouds-2"></div>
                <div className="clouds clouds-3"></div>
            </div>
            
            <div ref={gameWorldRef} className="game-world" style={{ width: worldWidth }}>
                <WaterSurface waterLevel={waterLevel} />

                <UnderwaterScenery worldWidth={worldWidth} waterLevel={waterLevel} />
                
                <div ref={boatRef} className="boat" style={{ background: `linear-gradient(180deg, ${customization.boatColor}, #5a2d0c)`}}>
                    <div className="boat-cabin"></div>
                    <div className="boat-mast">
                        <div className="boat-flag">{customization.flag}</div>
                    </div>
                    <div ref={lineAnchorRef} className="line-anchor"></div>
                </div>

                <div ref={hookRef} className="hook">
                    <div className="hook-arm hook-arm-left"></div>
                    <div className="hook-arm hook-arm-right"></div>
                    {caughtTrash && gamePhase !== 'depositing' && (
                        <div className="caught-trash-item">
                            {trashIcons[caughtTrash.icon] || '🗑️'}
                        </div>
                    )}
                </div>

                {underwaterTrash.map(item => (
                    <div key={item.id} className="collectible-trash" style={{ left: item.x, top: item.y }}>{trashIcons[item.icon] || '🗑️'}</div>
                ))}
                {fishes.map(fish => (
                    <div key={fish.id} className="swimming-fish" style={{ left: fish.x, top: fish.y, width: fish.size, height: fish.size*0.6, transform: fish.right ? '' : 'scaleX(-1)' }}></div>
                ))}
            </div>

            <svg className="line-svg">
                <line ref={lineRef} stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
            </svg>

             <div className="game-ui">
                <div className="capacity-bar">
                    <div className="capacity-bar-label">{t('capacity')}</div>
                    <div className="capacity-bar-bg"><div className="capacity-bar-fill" style={{ width: `${(collectedTrash.length / maxCapacity) * 100}%` }}></div></div>
                    <span>{collectedTrash.length}/{maxCapacity}</span>
                </div>
                <div className="game-score">{t('score')} {score}</div>
            </div>
            
            <div ref={depositedTrashRef} className="deposited-trash-animation"></div>

            {gamePhase === 'idle' && collectedTrash.length === 0 && <div className="game-prompt" dangerouslySetInnerHTML={{ __html: t('collectionPrompt') }} />}
            {collectedTrash.length >= maxCapacity && <div className="game-prompt" dangerouslySetInnerHTML={{ __html: t('boatFullPrompt') }} />}
        </div>
    );
};


const TrashSortingGame: FC<{ initialTrash: TrashItemData[], onGameEnd: (result: GameResult) => void; t: (key: TranslationKeys) => string; }> = ({ initialTrash, onGameEnd, t }) => {
    const [items, setItems] = useState<TrashItemData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [incorrectCount, setIncorrectCount] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string; id: number } | null>(null);
    const [activeBin, setActiveBin] = useState<TrashType | null>(null);
    const [sortedCounts, setSortedCounts] = useState<{ [key in TrashType]: number }>({ organic: 0, recyclable: 0, general: 0, hazardous: 0 });
    const [collectedMapPieces, setCollectedMapPieces] = useState(0);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const gameItems = initialTrash.filter(item => item.type !== 'collectible');
        const collectibles = initialTrash.filter(item => item.type === 'collectible');
        setCollectedMapPieces(collectibles.length);

        const shuffledItems = [...gameItems].sort(() => Math.random() - 0.5);
        setItems(shuffledItems);
        itemRefs.current = shuffledItems.map(() => null);
        setScore(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setCurrentIndex(0);
        setSortedCounts({ organic: 0, recyclable: 0, general: 0, hazardous: 0 });
    }, [initialTrash]);
    
    useEffect(() => {
        if (items.length > 0 && currentIndex >= items.length) {
            const timer = setTimeout(() => onGameEnd({ score, correct: correctCount, incorrect: incorrectCount, sortedCounts, collectedMapPieces }), 1000);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, items, score, correctCount, incorrectCount, onGameEnd, sortedCounts, collectedMapPieces]);

    useEffect(() => {
        itemRefs.current.forEach((el, index) => {
            if (!el) return;
            const offset = index - currentIndex;

            let x = '150%';
            let scale = 0.6;
            let opacity = 0;
            let zIndex = 0;

            if (offset === 0) { // Current item
                x = '0%';
                scale = 1;
                opacity = 1;
                zIndex = 10;
            } else if (offset > 0 && offset < 4) { // Upcoming items
                x = `${50 + (offset - 1) * 25}%`;
                scale = 0.7;
                opacity = 0.4;
                zIndex = 5 - offset;
            } else { // Sorted or far away items
                x = offset < 0 ? '-150%' : '150%';
                opacity = 0;
            }

            gsap.to(el, {
                x,
                scale,
                opacity,
                zIndex,
                duration: 0.5,
                ease: 'power3.out'
            });
        });

    }, [currentIndex, items]);

    const handleDragStart = (e: DragEvent<HTMLDivElement>, item: TrashItemData) => {
        e.dataTransfer.setData("trashId", item.id.toString());
        e.currentTarget.classList.add('dragging');
    };

    const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
        e.currentTarget.classList.remove('dragging');
        setActiveBin(null);
    };
    
    const handleDrop = (e: DragEvent<HTMLDivElement>, binType: TrashType) => {
        e.preventDefault();
        const trashId = parseInt(e.dataTransfer.getData("trashId"), 10);
        const droppedItem = items[currentIndex];
        
        if (droppedItem && droppedItem.id === trashId && droppedItem.type !== 'collectible') {
            if (droppedItem.type === binType) {
                setScore(s => s + 100);
                setCorrectCount(c => c + 1);
                setSortedCounts(counts => ({
                    ...counts,
                    [binType]: counts[binType] + 1
                }));
                setFeedback({ type: 'correct', message: t('greatJob'), id: Date.now() });
            } else {
                setScore(s => s - 25);
                setIncorrectCount(i => i + 1);
                setFeedback({ type: 'incorrect', message: droppedItem.feedback, id: Date.now() });
            }
            setCurrentIndex(i => i + 1);
        }
        setActiveBin(null);
    };
    
    const handleDragOver = (e: DragEvent<HTMLDivElement>, binType: TrashType) => {
        e.preventDefault();
        setActiveBin(binType);
    };

    const handleDragLeave = () => {
        setActiveBin(null);
    };
    
    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    const bins: { type: TrashType; name: TranslationKeys; icon: string; colorClass: string }[] = [
        { type: 'organic', name: 'organic', icon: '🌿', colorClass: 'bin-green' },
        { type: 'recyclable', name: 'recyclable', icon: '♻️', colorClass: 'bin-yellow' },
        { type: 'general', name: 'general', icon: '🗑️', colorClass: 'bin-blue' },
        { type: 'hazardous', name: 'hazardous', icon: '☣️', colorClass: 'bin-red' },
    ];
    
    if (initialTrash.length === 0) {
         return (
             <div className="w-full h-full flex flex-col items-center justify-center p-4">
                 <h2 className="font-display text-4xl dirty-crystal-text mb-4">{t('noTrashCollected')}</h2>
                 <p className="text-xl mb-8">{t('noTrashDesc')}</p>
                 <GameButton onClick={() => onGameEnd({ score: 0, correct: 0, incorrect: 0, sortedCounts: { organic: 0, recyclable: 0, general: 0, hazardous: 0 }, collectedMapPieces: 0 })} className="text-2xl">{t('backToHarbor')}</GameButton>
             </div>
         );
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="sorting-game-frame">
                {feedback && (
                    <div key={feedback.id} className={`feedback-popup ${feedback.type}`}>
                        <p className="feedback-title">{feedback.type === 'correct' ? t('greatJob') : t('oops')}</p>
                        <p className="feedback-message">{feedback.message}</p>
                    </div>
                )}
                
                <div className="sorting-conveyor-area">
                     {items.map((item, index) => (
                        <div
                            key={item.id}
                            ref={el => { if(el) itemRefs.current[index] = el; }}
                            draggable={index === currentIndex}
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                            className="trash-item-sortable"
                        >
                             <div className="trash-item-icon">{trashIcons[item.icon] || '🗑️'}</div>
                             <div className="trash-item-name">{item.name}</div>
                        </div>
                    ))}
                    {currentIndex >= items.length && (
                        <p className="text-2xl text-white/70">{t('allSorted')}</p>
                    )}
                </div>

                <div className="sorting-bins-grid">
                    {bins.map(bin => (
                        <div
                            key={bin.type}
                            onDrop={(e) => handleDrop(e, bin.type)}
                            onDragOver={(e) => handleDragOver(e, bin.type)}
                            onDragLeave={handleDragLeave}
                            className={`sorting-bin ${bin.colorClass} ${activeBin === bin.type ? 'drag-over' : ''}`}
                        >
                            <span className="text-4xl md:text-5xl">{bin.icon}</span>
                            <p className="font-display text-lg md:text-xl uppercase mt-2 font-bold">{t(bin.name)}</p>
                        </div>
                    ))}
                </div>
                
                <div className="sorting-footer">
                    <div className="sorting-progress-bar">
                        <div className="sorting-progress-bar-fill" style={{ width: `${(currentIndex / items.length) * 100}%`}}></div>
                        <span className="progress-bar-text">{currentIndex} / {items.length}</span>
                    </div>
                    <div className="sorting-score">{t('score')} {score}</div>
                </div>
            </div>
        </div>
    );
};

const ResultsScreen: FC<{ score: number; correct: number; incorrect: number; onContinue: () => void; isSaving: boolean; saveError: boolean; t: (key: TranslationKeys) => string; }> = ({ score, correct, incorrect, onContinue, isSaving, saveError, t }) => {
    const coinsEarned = score > 0 ? Math.floor(score / 5) : 0;
    const xpEarned = correct * 10;
    
    return (
         <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div className="results-popup bg-cyan-900/80 border-2 border-cyan-400/50 rounded-2xl p-8 w-full max-w-lg text-center shadow-2xl">
                <h2 className="font-display text-6xl dirty-crystal-text mb-4">{t('results')}</h2>
                <div className="text-2xl space-y-3 mb-8">
                    <p>{t('finalScore')}: <span className="font-bold text-yellow-300">{score}</span></p>
                    <p>{t('correctlySorted')}: <span className="font-bold text-green-400">{correct}</span></p>
                    <p>{t('incorrectlySorted')}: <span className="font-bold text-red-400">{incorrect}</span></p>
                </div>
                 <div className="bg-black/20 p-4 rounded-xl mb-8">
                     <h3 className="font-display text-3xl mb-2 text-yellow-200">{t('rewards')}</h3>
                     <p className="text-xl">💰 {t('coinsEarned')}: {coinsEarned}</p>
                     <p className="text-xl">✨ {t('xpGained')}: {xpEarned}</p>
                </div>
                {saveError && (
                    <p className="text-red-400 mb-4 animate-pulse">{t('saveError')}</p>
                )}
                <GameButton onClick={onContinue} disabled={isSaving} className="text-2xl">
                    {isSaving ? t('saving') : (saveError ? t('retry') : t('continue'))}
                </GameButton>
            </div>
        </div>
    )
}

const DailyRewardsModal: FC<{ onClose: () => void; onClaim: () => void; playerData: PlayerData; t: (key: TranslationKeys) => string; }> = ({ onClose, onClaim, playerData, t }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isClaiming, setIsClaiming] = useState(false);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);

    const streak = playerData.loginStreak || 0;
    
    const canClaim = canClaimDailyRewardCheck(playerData);
    
    const handleClaim = async () => {
        if (!canClaim || isClaiming) return;
        setIsClaiming(true);
        try {
            await onClaim();
        } catch (error) {
            console.error("Error claiming reward:", error);
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="reward-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{t('dailyRewards')}</h2>
                <div className="calendar-grid-container">
                    <div className="calendar-grid">
                        {DAILY_REWARDS.map((reward, index) => {
                            const day = index + 1;
                            const isClaimed = streak >= day;
                            const isClaimable = streak === index && canClaim;
                            return (
                                <div key={day} className={`calendar-day ${isClaimed ? 'claimed' : ''} ${isClaimable ? 'claimable' : ''}`}>
                                    <div className="calendar-day-header">{t('day')} {day}</div>
                                    <div className="calendar-day-body">
                                        {isClaimable ? (
                                            <GameButton onClick={handleClaim} disabled={isClaiming} className="claim-button">
                                                {isClaiming ? t('claiming') : t('claim')}
                                            </GameButton>
                                        ) : (
                                            <>
                                                <div className="calendar-day-reward">{reward.type === 'coins' ? '💰' : '💎'}</div>
                                                <div className="calendar-day-amount">{reward.amount.toLocaleString()}</div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuestsModal: FC<{ onClose: () => void; onClaim: (questId: string, isWeekly: boolean) => void; playerData: PlayerData; t: (key: TranslationKeys) => string; }> = ({ onClose, onClaim, playerData, t }) => {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
    const modalRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);
    
    const renderQuest = (q: Quest, isWeekly: boolean) => {
        const isComplete = q.progress >= q.target;
        const canClaim = isComplete && !q.claimed;
        
        let description = "";
        if (q.type === 'collect' && q.trashType) {
            const typeName = t(q.trashType as TranslationKeys);
            description = t('questCollect').replace('{target}', q.target.toString()).replace('{type}', typeName);
        } else if (q.type === 'score') {
            description = t('questScore').replace('{target}', q.target.toLocaleString());
        } else if (q.type === 'sort') {
            description = t('questSort').replace('{target}', q.target.toString());
        }

        return (
            <div key={q.id} className="quest-item">
                <div className="quest-info">
                    <p className="quest-description">{description}</p>
                    <p className="quest-reward">{t('rewards')}: {q.reward.amount} {q.reward.type === 'coins' ? '💰' : q.reward.type === 'xp' ? '✨' : '💎'}</p>
                    <div className="quest-progress-container">
                         <div className="quest-progress-bar" style={{width: `${Math.min((q.progress / q.target) * 100, 100)}%`}}></div>
                    </div>
                     <p className="text-xs text-right mt-1">{Math.min(q.progress, q.target)} / {q.target}</p>
                </div>
                <GameButton onClick={() => onClaim(q.id, isWeekly)} disabled={!canClaim} className="quest-claim-button">
                    {q.claimed ? t('claimed') : t('claim')}
                </GameButton>
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="quest-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{t('quests')}</h2>
                 <div className="leaderboard-tabs">
                    <button onClick={() => setActiveTab('daily')} className={activeTab === 'daily' ? 'active' : ''}>{t('dailyQuests')}</button>
                    <button onClick={() => setActiveTab('weekly')} className={activeTab === 'weekly' ? 'active' : ''}>{t('weeklyContracts')}</button>
                </div>
                <div className="quest-list">
                    {activeTab === 'daily' && (playerData.dailyQuests || []).length > 0 ? (
                        playerData.dailyQuests.map(q => renderQuest(q, false))
                    ) : activeTab === 'daily' ? (
                        <p className="text-center p-8 text-cyan-200">{t('noDailyQuests')}</p>
                    ) : null}

                    {activeTab === 'weekly' && playerData.weeklyContract ? (
                        renderQuest(playerData.weeklyContract, true)
                    ) : activeTab === 'weekly' ? (
                        <p className="text-center p-8 text-cyan-200">{t('noWeeklyContract')}</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

const UpgradesModal: FC<{ onClose: () => void; onUpgrade: (type: 'capacity' | 'hookSpeed') => void; playerData: PlayerData; t: (key: TranslationKeys) => string; }> = ({ onClose, onUpgrade, playerData, t }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);

    const renderUpgrade = (type: 'capacity' | 'hookSpeed') => {
        const currentLevel = playerData.upgrades[type];
        const isMaxLevel = type === 'capacity' ? currentLevel >= MAX_LEVEL_CAPACITY : currentLevel >= MAX_LEVEL_HOOK_SPEED;
        const cost = isMaxLevel ? null : (type === 'capacity' ? UPGRADE_COSTS.capacity[currentLevel - 1] : UPGRADE_COSTS.hookSpeed[currentLevel - 1]);
        const canAfford = cost && playerData.coins >= cost.coins && playerData.upgradeCores >= cost.cores;

        return (
            <div className="upgrade-item">
                <div className="upgrade-header">
                    <h3 className="upgrade-name">{t(type === 'capacity' ? 'upgradeBoatCapacity' : 'upgradeHookSpeed')}</h3>
                    <p className="upgrade-level">{t('level')} {currentLevel}</p>
                </div>
                <p className="upgrade-description">{t(type === 'capacity' ? 'upgradeDescCapacity' : 'upgradeDescHookSpeed')}</p>
                <div className="upgrade-cost">
                    <p className="font-bold mb-2">{isMaxLevel ? t('maxLevel') : t('cost')}</p>
                    {cost && !isMaxLevel && (
                        <div className="flex justify-center gap-4">
                            <span>💰 {cost.coins}</span>
                            {cost.cores > 0 && <span>💎 {cost.cores}</span>}
                        </div>
                    )}
                </div>
                <GameButton onClick={() => onUpgrade(type)} disabled={isMaxLevel || !canAfford}>
                    {isMaxLevel ? t('maxLevel') : (canAfford ? t('upgrade') : t('notEnoughResources'))}
                </GameButton>
            </div>
        );
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="upgrade-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text">{t('upgrades')}</h2>
                    <div className="text-lg bg-black/20 px-4 py-2 rounded-full">
                        💰 {playerData.coins.toLocaleString()} | 💎 {playerData.upgradeCores.toLocaleString()}
                    </div>
                </div>
                <div className="upgrades-list">
                    {renderUpgrade('capacity')}
                    {renderUpgrade('hookSpeed')}
                </div>
            </div>
        </div>
    );
};

const QuestCompletionToast: FC<{ quests: Quest[], onDone: () => void, t: (key: TranslationKeys) => string }> = ({ quests, onDone, t }) => {
    useEffect(() => {
        const totalDuration = 5000 + (quests.length - 1) * 1000;
        const timer = setTimeout(() => onDone(), totalDuration);
        return () => clearTimeout(timer);
    }, [quests, onDone]);

    return (
        <div className="quest-toast-container">
            {quests.map((q, i) => {
                 let description = "";
                 if (q.type === 'collect' && q.trashType) {
                     const typeName = t(q.trashType as TranslationKeys);
                     description = t('questCollect').replace('{target}', q.target.toString()).replace('{type}', typeName);
                 } else if (q.type === 'score') {
                     description = t('questScore').replace('{target}', q.target.toLocaleString());
                 } else if (q.type === 'sort') {
                     description = t('questSort').replace('{target}', q.target.toString());
                 }
                return (
                    <div key={i} className="quest-toast" style={{ animationDelay: `${i * 0.5}s`, animationDuration: '5s' }}>
                        <div className="toast-icon">🏆</div>
                        <div>
                            <p className="toast-title">{t('questComplete')}</p>
                            <p className="toast-description">{description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const LoginPromptModal: FC<{ onClose: () => void; onLogin: () => void; t: (key: TranslationKeys) => string; }> = ({ onClose, onLogin, t }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);

    return (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div ref={modalRef} className="profile-modal-popup bg-cyan-900/80 border-2 border-cyan-400/50 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-4">{t('loginRequired')}</h2>
                <p className="text-lg text-cyan-100 mb-8">{t('loginPromptMessage')}</p>
                <GameButton onClick={onLogin} className="text-xl">
                    <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.032,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                    {t('signInWithGoogle')}
                </GameButton>
            </div>
        </div>
    );
};

// --- NEW FEATURE MODALS ---

const ResearchModal: FC<{ onClose: () => void; playerData: PlayerData; t: (key: TranslationKeys) => string; onStart: (researchId: string) => void; onComplete: (researchId: string) => void; }> = ({ onClose, playerData, t, onStart, onComplete }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);

    const renderResearchItem = (research: ResearchData) => {
        const playerResearch = playerData.research[research.id] || { level: 0, researchCompleteTime: null };
        const isMaxLevel = playerResearch.level >= research.maxLevel;
        
        const researchCompleteTime = playerResearch.researchCompleteTime ? playerResearch.researchCompleteTime.toDate() : null;
        const isReadyToComplete = researchCompleteTime && researchCompleteTime <= new Date();
        const isInProgress = researchCompleteTime && !isReadyToComplete;

        const cost = isMaxLevel ? null : research.costs[playerResearch.level];
        const canAfford = cost && playerData.upgradeCores >= cost.cores;

        let button;
        if (isReadyToComplete) {
            button = <GameButton onClick={() => onComplete(research.id)}>{t('complete')}</GameButton>;
        } else if (isInProgress) {
            button = <GameButton onClick={() => {}} disabled={true}>{t('inProgress')}</GameButton>;
        } else if (isMaxLevel) {
            button = <GameButton onClick={() => {}} disabled={true}>{t('maxLevel')}</GameButton>;
        } else {
             button = <GameButton onClick={() => onStart(research.id)} disabled={!canAfford}>{canAfford ? t('startResearch') : t('notEnoughResources')}</GameButton>;
        }

        return (
            <div key={research.id} className="research-item">
                 <div className="upgrade-header">
                    <h3 className="upgrade-name">{research.name}</h3>
                    <p className="upgrade-level">{t('level')} {playerResearch.level}</p>
                </div>
                <p className="upgrade-description">{research.description}</p>
                <div className="upgrade-cost">
                    <p className="font-bold mb-2">{isMaxLevel ? t('maxLevel') : t('cost')}</p>
                     {cost && !isMaxLevel && (
                        <div className="flex justify-center gap-4">
                            <span>💎 {cost.cores}</span>
                            <span>⏰ {t('researchTime').replace('{hours}', cost.durationHours.toString())}</span>
                        </div>
                    )}
                </div>
                {button}
            </div>
        );
    }
    
    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="research-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text">{t('researchAndDev')}</h2>
                    <div className="text-lg bg-black/20 px-4 py-2 rounded-full">💎 {playerData.upgradeCores.toLocaleString()}</div>
                </div>
                <div className="research-list">
                    {RESEARCH_DATA.map(renderResearchItem)}
                </div>
            </div>
        </div>
    );
};

const MarketModal: FC<{ onClose: () => void; playerData: PlayerData; t: (key: TranslationKeys) => string; onCraft: () => void; }> = ({ onClose, playerData, t, onCraft }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);

    const order = playerData.marketOrder;
    let canCraft = false;
    if (order) {
        canCraft = Object.entries(order.required).every(([type, amount]) => {
            return (playerData.inventory[type as TrashType] || 0) >= amount;
        });
    }

    const rewardIcon = order?.reward.type === 'coins' ? '💰' : order?.reward.type === 'upgradeCore' ? '💎' : '🐠';

    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="market-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{t('marketOrders')}</h2>
                {order ? (
                    <div className="market-order-item">
                        <h3 className="text-2xl text-cyan-200">Special Order</h3>
                        <div className="market-required-list">
                             {(Object.keys(order.required) as TrashType[]).map(type => (
                                <div key={type} className="market-required-item">
                                    <span>{t(type as TranslationKeys)} x{order.required[type]}</span>
                                    <span className={(playerData.inventory[type] || 0) < (order.required[type] || 0) ? 'text-red-400' : 'text-green-400'}>
                                        {(playerData.inventory[type] || 0)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xl my-4">Reward: {rewardIcon} {order.reward.amount}</p>
                        <GameButton onClick={onCraft} disabled={!canCraft}>
                            {canCraft ? t('craft') : t('notEnoughItems')}
                        </GameButton>
                    </div>
                ) : (
                    <p>{t('noWeeklyContract')}</p> 
                )}
            </div>
        </div>
    );
}

const CustomizationModal: FC<{ onClose: () => void; playerData: PlayerData; t: (key: TranslationKeys) => string; onSave: (customization: PlayerCustomization) => void; }> = ({ onClose, playerData, t, onSave }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [currentColor, setCurrentColor] = useState(playerData.customization.boatColor);
    const [currentFlag, setCurrentFlag] = useState(playerData.customization.flag);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);

    const handleSave = () => {
        onSave({ boatColor: currentColor, flag: currentFlag });
        onClose();
    };

    return (
         <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div ref={modalRef} className="customization-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{t('boatCustomization')}</h2>
                <div className="customization-content">
                    <div>
                        <h3 className="text-2xl mb-4">{t('boatColor')}</h3>
                        <div className="color-picker">
                            {BOAT_COLORS.map(color => (
                                <div key={color} onClick={() => setCurrentColor(color)} className={`color-swatch ${currentColor === color ? 'selected' : ''}`} style={{ backgroundColor: color }} />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-2xl mb-4">{t('flag')}</h3>
                        <div className="flag-picker">
                            {BOAT_FLAGS.map(flag => (
                                <div key={flag} onClick={() => setCurrentFlag(flag)} className={`flag-item ${currentFlag === flag ? 'selected' : ''}`}>{flag}</div>
                            ))}
                        </div>
                    </div>
                </div>
                 <GameButton onClick={handleSave} className="mt-8 text-xl">{t('saveChanges')}</GameButton>
            </div>
        </div>
    );
};

const CoralReefModal: FC<{ onClose: () => void; playerData: PlayerData; t: (key: TranslationKeys) => string; onContribute: (amount: number) => void; }> = ({ onClose, playerData, t, onContribute }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [amount, setAmount] = useState(1);
    useLayoutEffect(() => { gsap.from(modalRef.current, { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }); }, []);
    
    const canContribute = playerData.coralFragments >= amount && amount > 0;

    return (
        <div className="absolute inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div ref={modalRef} className="coral-modal-popup">
                <button onClick={onClose} className="absolute top-4 right-4 text-cyan-200 hover:text-white transition-colors text-3xl">&times;</button>
                <h2 className="font-display text-4xl md:text-5xl dirty-crystal-text mb-6">{t('reefRestoration')}</h2>
                <p className="mb-4">{t('restorationProgress').replace('{progress}', playerData.coralReefProgress.toString())}</p>
                <div className="coral-progress-bar">
                    <div className="coral-progress-fill" style={{width: `${playerData.coralReefProgress}%`}} />
                </div>
                <div className="mt-4">
                    <p>Your Fragments: {playerData.coralFragments}</p>
                    <GameButton onClick={() => onContribute(1)} disabled={playerData.coralFragments < 1}>{t('contribute')} 1 🐠</GameButton>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

type GameState = 'TITLE' | 'HARBOR' | 'COLLECTING' | 'SORTING' | 'RESULTS';

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  const prev = ref.current;
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return prev;
}

const App: FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [isGuest, setIsGuest] = useState(false);
    const [gameState, setGameState] = useState<GameState>('TITLE');
    const [showProfileSetupPopup, setShowProfileSetupPopup] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showDailyRewards, setShowDailyRewards] = useState(false);
    const [showQuests, setShowQuests] = useState(false);
    const [showUpgrades, setShowUpgrades] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showResearch, setShowResearch] = useState(false);
    const [showMarket, setShowMarket] = useState(false);
    const [showCustomization, setShowCustomization] = useState(false);
    const [showCoralReef, setShowCoralReef] = useState(false);
    const [collectedTrash, setCollectedTrash] = useState<TrashItemData[] | null>(null);
    const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);
    const [authInitializing, setAuthInitializing] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [saveError, setSaveError] = useState(false);
    const [completedQuestsForToast, setCompletedQuestsForToast] = useState<Quest[]>([]);
    
    const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('language') as Language) || 'en');

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const t = React.useCallback((key: TranslationKeys): string => {
        return translations[language][key] || translations['en'][key];
    }, [language]);

    const tRef = useRef(t);
    useEffect(() => {
        tRef.current = t;
    }, [t]);

    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'th' : 'en');
    
    const allTrashItems = React.useMemo(() => getLocalizedTrashItems(t), [t]);

    // --- LOGIN REWARD POPUP LOGIC ---
    const prevUser = usePrevious(user);
    const loginEventPending = useRef(false);

    useEffect(() => {
        if (!prevUser && user && !user.isAnonymous) {
            loginEventPending.current = true;
        }
    }, [user, prevUser]);

    useEffect(() => {
        if (loginEventPending.current && playerData && !isGuest) {
            if (canClaimDailyRewardCheck(playerData)) {
                setTimeout(() => setShowDailyRewards(true), 500);
            }
            loginEventPending.current = false;
        }
    }, [playerData, isGuest]);
    // --- END LOGIN REWARD POPUP LOGIC ---

    const handleLogout = () => {
        if (isGuest) {
            setGameState('TITLE');
        } else {
            signOut(auth).catch(error => console.error("Logout Error:", error));
        }
    };
    
    const defaultGuestData: PlayerData = {
        level: 1, xp: 150, coins: 0, displayName: 'Guest', photoURL: '🤔',
        totalScore: 0, weeklyScore: 0, lastWeeklyUpdate: 0, lastLoginClaim: null,
        loginStreak: 0, upgradeCores: 0, dailyQuests: [], weeklyContract: null,
        lastDailyQuestRefresh: null, lastWeeklyContractRefresh: null,
        upgrades: { capacity: 1, hookSpeed: 1 }, research: {},
        customization: { boatColor: '#8b4513', flag: '🏴‍☠️' },
        inventory: { organic: 0, recyclable: 0, general: 0, hazardous: 0 },
        marketOrder: null, lastMarketOrderRefresh: null, collectibles: { mapPieces: 0 },
        coralReefProgress: 0, coralFragments: 0
    };

    const authStateChangedRef = useRef(false);
    useEffect(() => {
        if(authStateChangedRef.current) return;
        authStateChangedRef.current = true;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                if (currentUser.isAnonymous) {
                    setUser(currentUser); setIsGuest(true); setPlayerData(defaultGuestData); setGameState('HARBOR');
                } else {
                    setIsGuest(false);
                    try {
                        const playerDocRef = doc(db, "players", currentUser.uid);
                        const playerDocSnap = await getDoc(playerDocRef);

                        if (playerDocSnap.exists()) {
                            const dataFromDb = playerDocSnap.data();
                            
                             let finalPlayerData: PlayerData = {
                                level: 1, xp: 0, coins: 0, totalScore: 0, weeklyScore: 0, lastWeeklyUpdate: 0,
                                lastLoginClaim: null, loginStreak: 0, upgradeCores: 0, coralFragments: 0,
                                dailyQuests: [], weeklyContract: null, lastDailyQuestRefresh: null, lastWeeklyContractRefresh: null,
                                upgrades: { capacity: 1, hookSpeed: 1 }, research: {}, customization: { boatColor: '#8b4513', flag: '🏴‍☠️' },
                                inventory: { organic: 0, recyclable: 0, general: 0, hazardous: 0 },
                                marketOrder: null, lastMarketOrderRefresh: null, collectibles: { mapPieces: 0 }, coralReefProgress: 0,
                                ...dataFromDb, 
                                displayName: currentUser.displayName || dataFromDb.displayName || tRef.current('adventurer'),
                                photoURL: currentUser.photoURL || dataFromDb.photoURL || '🐙'
                            };

                            // --- QUEST & EVENT GENERATION/REFRESH LOGIC ---
                            const updatesToDb: { [key: string]: any } = {};
                            let needsDbUpdate = false;
                            const now = Date.now();
                            const lastDailyRefreshTime = finalPlayerData.lastDailyQuestRefresh?.toDate().getTime() || 0;
                            const lastWeeklyRefreshTime = finalPlayerData.lastWeeklyContractRefresh?.toDate().getTime() || 0;
                            const lastMarketRefreshTime = finalPlayerData.lastMarketOrderRefresh?.toDate().getTime() || 0;
                            
                            if (now - lastDailyRefreshTime > 24 * 60 * 60 * 1000) {
                                needsDbUpdate = true;
                                const shuffled = [...allQuestsPool].sort(() => 0.5 - Math.random());
                                const newQuests = shuffled.slice(0, 3).map((q, i) => ({ ...q, id: `daily_${Date.now()}_${i}`, progress: 0, claimed: false }));
                                finalPlayerData.dailyQuests = newQuests;
                                updatesToDb.dailyQuests = newQuests;
                                updatesToDb.lastDailyQuestRefresh = serverTimestamp();
                            }
                             if (now - lastMarketRefreshTime > 24 * 60 * 60 * 1000) {
                                needsDbUpdate = true;
                                const newOrder = { ...MARKET_ORDER_POOL[Math.floor(Math.random() * MARKET_ORDER_POOL.length)], id: `market_${Date.now()}` };
                                finalPlayerData.marketOrder = newOrder;
                                updatesToDb.marketOrder = newOrder;
                                updatesToDb.lastMarketOrderRefresh = serverTimestamp();
                             }
                            if (now - lastWeeklyRefreshTime > 7 * 24 * 60 * 60 * 1000) {
                                needsDbUpdate = true;
                                const newContract = { ...allContractsPool[Math.floor(Math.random() * allContractsPool.length)], id: `weekly_${Date.now()}`, progress: 0, claimed: false };
                                finalPlayerData.weeklyContract = newContract;
                                updatesToDb.weeklyContract = newContract;
                                updatesToDb.lastWeeklyContractRefresh = serverTimestamp();
                            }
                            


                            if (needsDbUpdate) { await setDoc(playerDocRef, updatesToDb, { merge: true }); }
                            setPlayerData(finalPlayerData);
                        } else {
                            const newPlayerData: PlayerData = { 
                                level: 1, xp: 0, coins: 0, displayName: currentUser.displayName || tRef.current('adventurer'),
                                photoURL: currentUser.photoURL || '🐙', totalScore: 0, weeklyScore: 0, lastWeeklyUpdate: 0,
                                lastLoginClaim: null, loginStreak: 0, upgradeCores: 0, coralFragments: 0,
                                dailyQuests: [], weeklyContract: null, lastDailyQuestRefresh: null, lastWeeklyContractRefresh: null,
                                upgrades: { capacity: 1, hookSpeed: 1 }, research: {}, customization: { boatColor: '#8b4513', flag: '🏴‍☠️' },
                                inventory: { organic: 0, recyclable: 0, general: 0, hazardous: 0 },
                                marketOrder: null, lastMarketOrderRefresh: null, collectibles: { mapPieces: 0 }, coralReefProgress: 0,
                            };
                            await setDoc(playerDocRef, newPlayerData);
                             const shuffledQuests = [...allQuestsPool].sort(() => 0.5 - Math.random());
                             const newQuests = shuffledQuests.slice(0, 3).map((q, i) => ({ ...q, id: `daily_${Date.now()}_${i}`, progress: 0, claimed: false }));
                             const newContract = { ...allContractsPool[Math.floor(Math.random() * allContractsPool.length)], id: `weekly_${Date.now()}`, progress: 0, claimed: false };
                             const newOrder = { ...MARKET_ORDER_POOL[Math.floor(Math.random() * MARKET_ORDER_POOL.length)], id: `market_${Date.now()}` };
                             newPlayerData.dailyQuests = newQuests; newPlayerData.weeklyContract = newContract; newPlayerData.marketOrder = newOrder;
                             await setDoc(playerDocRef, {
                                 dailyQuests: newQuests, lastDailyQuestRefresh: serverTimestamp(),
                                 weeklyContract: newContract, lastWeeklyContractRefresh: serverTimestamp(),
                                 marketOrder: newOrder, lastMarketOrderRefresh: serverTimestamp()
                             }, { merge: true });
                            setPlayerData(newPlayerData);
                        }
                        setUser(currentUser);
                        const profileSetupComplete = localStorage.getItem(`profileSetupComplete_${currentUser.uid}`);
                        if (!profileSetupComplete) { setShowProfileSetupPopup(true); } else { setGameState('HARBOR'); }
                    } catch (error) {
                        console.error("Firestore Error on Auth State Change:", error);
                        alert(tRef.current('profileLoadError'));
                        handleLogout();
                    }
                }
            } else {
                setUser(null); setPlayerData(null); setIsGuest(false); setGameState('TITLE');
            }
            setAuthInitializing(false);
        });
        
        return () => unsubscribe();
    }, []);
    
     useEffect(() => {
        if (!user) { setGlobalStats(null); return; };
        const statsDocRef = doc(db, 'globalStats', 'main');
        const unsubscribe = onSnapshot(statsDocRef, (docSnap) => {
            if (docSnap.exists()) { setGlobalStats(docSnap.data() as GlobalStats); } else {
                setGlobalStats({ totalItems: 0, organic: 0, recyclable: 0, general: 0, hazardous: 0 });
            }
        }, (error) => console.error("Failed to listen to global stats:", error));
        return () => unsubscribe();
    }, [user]);
    
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            setShowLoginPrompt(false);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    const handlePlayGuest = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Anonymous Sign-In Error:", error);
            alert(t('guestSessionError'));
        }
    };

    const handleCollectionEnd = (items: TrashItemData[]) => {
        setCollectedTrash(items);
        setGameState('SORTING');
    }
    
    const handleSortEnd = (result: GameResult) => {
        setLastGameResult(result);
        setGameState('RESULTS');
    };

    const handleReturnToHarbor = async () => {
        if (!lastGameResult || !user || isGuest) {
            setGameState('HARBOR');
            return;
        }

        setIsSaving(true); setSaveError(false);
        const { score, correct, incorrect, sortedCounts, collectedMapPieces } = lastGameResult;
        
        try {
            let finalPlayerData: PlayerData | null = null;
            let newlyCompletedQuests: Quest[] = [];

            await runTransaction(db, async (transaction) => {
                const statsDocRef = doc(db, 'globalStats', 'main');
                const playerDocRef = doc(db, "players", user.uid);
                const [statsDoc, playerDoc] = await Promise.all([ transaction.get(statsDocRef), transaction.get(playerDocRef) ]);

                if (!playerDoc.exists()) throw new Error("Player document not found.");

                const totalNewItems = Object.values(sortedCounts).reduce((sum: number, count) => sum + Number(count), 0);
                 if (statsDoc.exists()) {
                    const statsUpdateData: { [key: string]: any } = { totalItems: increment(Number(totalNewItems)) };
                    for (const type in sortedCounts) {
                        if ((sortedCounts[type as TrashType] || 0) > 0) {
                            statsUpdateData[type] = increment(sortedCounts[type as TrashType]);
                        }
                    }
                    transaction.update(statsDocRef, statsUpdateData);
                } else {
                     const initialStats: GlobalStats = {
                        totalItems: Number(totalNewItems), organic: Number(sortedCounts.organic) || 0,
                        recyclable: Number(sortedCounts.recyclable) || 0, general: Number(sortedCounts.general) || 0,
                        hazardous: Number(sortedCounts.hazardous) || 0,
                    };
                    transaction.set(statsDocRef, initialStats);
                }

                const currentPlayerData = playerDoc.data() as PlayerData;
                const xpEarned = correct * 10;
                const coinsEarned = score > 0 ? Math.floor(score / 5) : 0;
                let newXp = currentPlayerData.xp + xpEarned;
                let newLevel = currentPlayerData.level;
                let xpForNextLevel = newLevel * 500;
                while (newXp >= xpForNextLevel) {
                    newXp -= xpForNextLevel; newLevel++; xpForNextLevel = newLevel * 500;
                }
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                startOfWeek.setHours(0, 0, 0, 0);
                const newWeeklyScore = (currentPlayerData.lastWeeklyUpdate >= startOfWeek.getTime()) ? currentPlayerData.weeklyScore + score : score;
                const newInventory = { ...currentPlayerData.inventory };
                (Object.keys(sortedCounts) as TrashType[]).forEach(type => { newInventory[type] = (newInventory[type] || 0) + sortedCounts[type]; });

                const updatedQuests = (currentPlayerData.dailyQuests || []).map(q => {
                    if (q.claimed || q.progress >= q.target) return q;
                    let progressIncrement = 0;
                    if (q.type === 'collect' && q.trashType) progressIncrement = sortedCounts[q.trashType];
                    if (q.type === 'sort') progressIncrement = correct;
                    if (q.type === 'score') progressIncrement = score > q.progress ? score - q.progress : 0;
                    const newProgress = q.progress + progressIncrement;
                    if (newProgress >= q.target && q.progress < q.target) newlyCompletedQuests.push({ ...q, progress: newProgress });
                    return { ...q, progress: newProgress };
                });

                let updatedContract = currentPlayerData.weeklyContract;
                if (updatedContract && !updatedContract.claimed && updatedContract.progress < updatedContract.target) {
                     let progressIncrement = 0;
                     if (updatedContract.type === 'collect' && updatedContract.trashType) progressIncrement = sortedCounts[updatedContract.trashType];
                     if (updatedContract.type === 'sort') progressIncrement = correct;
                     if (updatedContract.type === 'score') progressIncrement = score > updatedContract.progress ? score - updatedContract.progress : 0;
                     const newProgress = updatedContract.progress + progressIncrement;
                     if (newProgress >= updatedContract.target && updatedContract.progress < updatedContract.target) newlyCompletedQuests.push({ ...updatedContract, progress: newProgress });
                     updatedContract = { ...updatedContract, progress: newProgress };
                }

                finalPlayerData = {
                    ...currentPlayerData, level: newLevel, xp: newXp,
                    coins: currentPlayerData.coins + coinsEarned, totalScore: currentPlayerData.totalScore + score,
                    weeklyScore: newWeeklyScore, lastWeeklyUpdate: Date.now(),
                    dailyQuests: updatedQuests, weeklyContract: updatedContract, inventory: newInventory,
                    collectibles: { ...currentPlayerData.collectibles, mapPieces: (currentPlayerData.collectibles?.mapPieces || 0) + collectedMapPieces }
                };
                
                transaction.set(playerDocRef, finalPlayerData);
            });

            if (finalPlayerData) setPlayerData(finalPlayerData);
            if (newlyCompletedQuests.length > 0) setCompletedQuestsForToast(newlyCompletedQuests);
            
            setIsSaving(false); setGameState('HARBOR');
        } catch (error) {
            console.error("Failed to save progress:", error);
            setIsSaving(false); setSaveError(true);
        }
    };

    const handleProfileSave = (updatedUser: User) => {
        localStorage.setItem(`profileSetupComplete_${updatedUser.uid}`, 'true');
        setUser(updatedUser);
        setPlayerData(prev => prev ? { ...prev, displayName: updatedUser.displayName || prev.displayName, photoURL: updatedUser.photoURL || prev.photoURL } : null);
        setShowProfileSetupPopup(false); setIsEditingProfile(false);
        if (gameState !== 'HARBOR') setGameState('HARBOR');
    };

    const handleClaimDailyReward = async () => {
        if (!user || !playerData || !canClaimDailyRewardCheck(playerData)) return;

        await runTransaction(db, async (transaction) => {
            const playerDocRef = doc(db, "players", user.uid);
            const playerDoc = await transaction.get(playerDocRef);
            if (!playerDoc.exists()) throw new Error("Player not found");
            
            const currentData = playerDoc.data() as PlayerData;
            const rewardIndex = currentData.loginStreak || 0;

            if (rewardIndex >= DAILY_REWARDS.length) { console.warn("Reward out of bounds."); return; }

            const reward = DAILY_REWARDS[rewardIndex];
            const updates: { [key: string]: any } = { loginStreak: increment(1), lastLoginClaim: serverTimestamp() };
            if(reward.type === 'coins') updates.coins = increment(reward.amount);
            if(reward.type === 'upgradeCore') updates.upgradeCores = increment(reward.amount);
            
            transaction.update(playerDocRef, updates);
        });

        setPlayerData(prev => {
            if (!prev) return prev;
            const rewardIndex = prev.loginStreak || 0;
            if (rewardIndex >= DAILY_REWARDS.length) return prev;
            const reward = DAILY_REWARDS[rewardIndex];
            return {
                ...prev, loginStreak: prev.loginStreak + 1, lastLoginClaim: Timestamp.now(),
                coins: reward.type === 'coins' ? prev.coins + reward.amount : prev.coins,
                upgradeCores: reward.type === 'upgradeCore' ? prev.upgradeCores + reward.amount : prev.upgradeCores,
            };
        });
    };
    
    const handleClaimQuestReward = async (questId: string, isWeekly: boolean) => {
         if (!user || !playerData) return;
        const quest = isWeekly ? playerData.weeklyContract : playerData.dailyQuests.find(q => q.id === questId);
        if (!quest) return;

        await runTransaction(db, async (transaction) => {
            const playerDocRef = doc(db, "players", user.uid);
            const playerDoc = await transaction.get(playerDocRef);
            if (!playerDoc.exists()) throw new Error("Player not found");
            const currentData = playerDoc.data() as PlayerData;
            const updates: { [key: string]: any } = {};
            if (quest.reward.type === 'coins') updates.coins = increment(quest.reward.amount);
            if (quest.reward.type === 'xp') updates.xp = increment(quest.reward.amount);
            if (quest.reward.type === 'upgradeCore') updates.upgradeCores = increment(quest.reward.amount);
            if (isWeekly) { updates['weeklyContract.claimed'] = true; } else {
                 updates['dailyQuests'] = currentData.dailyQuests.map(q => q.id === questId ? { ...q, claimed: true } : q);
            }
            transaction.update(playerDocRef, updates);
        });
        
        setPlayerData(prev => {
             if (!prev) return null;
             return {
                ...prev,
                coins: quest.reward.type === 'coins' ? prev.coins + quest.reward.amount : prev.coins,
                xp: quest.reward.type === 'xp' ? prev.xp + quest.reward.amount : prev.xp,
                upgradeCores: quest.reward.type === 'upgradeCore' ? prev.upgradeCores + quest.reward.amount : prev.upgradeCores,
                dailyQuests: isWeekly ? prev.dailyQuests : prev.dailyQuests.map(q => q.id === questId ? {...q, claimed: true} : q),
                weeklyContract: isWeekly && prev.weeklyContract ? {...prev.weeklyContract, claimed: true} : prev.weeklyContract,
             }
        });
    };

    const handleUpgrade = async (type: 'capacity' | 'hookSpeed') => {
        if (!user || !playerData) return;
        const currentLevel = playerData.upgrades[type];
        const isMaxLevel = type === 'capacity' ? currentLevel >= MAX_LEVEL_CAPACITY : currentLevel >= MAX_LEVEL_HOOK_SPEED;
        if (isMaxLevel) return;
        const cost = (type === 'capacity' ? UPGRADE_COSTS.capacity[currentLevel - 1] : UPGRADE_COSTS.hookSpeed[currentLevel - 1]);
        if (!cost || playerData.coins < cost.coins || playerData.upgradeCores < cost.cores) return;

         await runTransaction(db, async (transaction) => {
            const playerDocRef = doc(db, "players", user.uid);
            const playerDoc = await transaction.get(playerDocRef);
            if (!playerDoc.exists()) throw new Error("Player not found");
            const updates: { [key: string]: any } = {
                coins: increment(-cost.coins), upgradeCores: increment(-cost.cores), [`upgrades.${type}`]: increment(1)
            };
            transaction.update(playerDocRef, updates);
         });
         
        setPlayerData(prev => {
            if(!prev) return null;
            return {
                ...prev, coins: prev.coins - cost.coins, upgradeCores: prev.upgradeCores - cost.cores,
                upgrades: { ...prev.upgrades, [type]: prev.upgrades[type] + 1 }
            }
        });
    };
    
    const handleStartResearch = async (researchId: string) => {
        if (!user || !playerData) return;
        const researchInfo = RESEARCH_DATA.find(r => r.id === researchId);
        const playerResearch = playerData.research[researchId] || { level: 0, researchCompleteTime: null };
        if (!researchInfo || playerResearch.level >= researchInfo.maxLevel || playerResearch.researchCompleteTime) return;
        
        const cost = researchInfo.costs[playerResearch.level];
        if (playerData.upgradeCores < cost.cores) return;

        const completeTime = new Date(Date.now() + cost.durationHours * 60 * 60 * 1000);
        
        await runTransaction(db, async transaction => {
            const playerDocRef = doc(db, "players", user.uid);
            transaction.update(playerDocRef, {
                upgradeCores: increment(-cost.cores),
                [`research.${researchId}.researchCompleteTime`]: Timestamp.fromDate(completeTime)
            });
        });

        setPlayerData(prev => {
            if (!prev) return null;
            const newResearch = { ...prev.research, [researchId]: { ...playerResearch, researchCompleteTime: Timestamp.fromDate(completeTime) } };
            return { ...prev, upgradeCores: prev.upgradeCores - cost.cores, research: newResearch };
        });
    };

    const handleCompleteResearch = async (researchId: string) => {
        if (!user || !playerData) return;
        const researchInfo = RESEARCH_DATA.find(r => r.id === researchId);
        const playerResearch = playerData.research[researchId];
        if (!researchInfo || !playerResearch || !playerResearch.researchCompleteTime || playerResearch.researchCompleteTime.toDate() > new Date()) {
            return;
        }

        await runTransaction(db, async transaction => {
            const playerDocRef = doc(db, "players", user.uid);
            transaction.update(playerDocRef, {
                [`research.${researchId}.researchCompleteTime`]: null,
                [`research.${researchId}.level`]: increment(1)
            });
        });

        setPlayerData(prev => {
            if (!prev) return null;
            const newResearch = { ...prev.research };
            newResearch[researchId] = {
                ...newResearch[researchId],
                level: newResearch[researchId].level + 1,
                researchCompleteTime: null
            };
            return { ...prev, research: newResearch };
        });
    };

    const handleSaveCustomization = async (customization: PlayerCustomization) => {
        if (!user || !playerData) return;
        await setDoc(doc(db, "players", user.uid), { customization }, { merge: true });
        setPlayerData(prev => prev ? { ...prev, customization } : null);
    };

    const handleCraftMarketOrder = async () => {
        if (!user || !playerData || !playerData.marketOrder) return;
        const order = playerData.marketOrder;
        
        await runTransaction(db, async transaction => {
            const playerDocRef = doc(db, "players", user.uid);
            const playerDoc = await transaction.get(playerDocRef);
            if (!playerDoc.exists()) throw new Error("Player not found");
            
            const currentData = playerDoc.data() as PlayerData;
            const canAfford = Object.entries(order.required).every(([type, amount]) => (currentData.inventory[type as TrashType] || 0) >= Number(amount));
            if (!canAfford) throw new Error("Not enough inventory");

            const updates: { [key: string]: any } = { marketOrder: null };
            Object.entries(order.required).forEach(([type, amount]) => {
                updates[`inventory.${type}`] = increment(-amount);
            });
            if (order.reward.type === 'coins') updates.coins = increment(order.reward.amount);
            if (order.reward.type === 'upgradeCore') updates.upgradeCores = increment(order.reward.amount);
            if (order.reward.type === 'coralFragment') updates.coralFragments = increment(order.reward.amount);
            
            transaction.update(playerDocRef, updates);
        });

        setPlayerData(prev => {
            if (!prev || !prev.marketOrder) return prev;
            const newInventory = { ...prev.inventory };
            Object.entries(prev.marketOrder.required).forEach(([type, amount]) => {
                newInventory[type as TrashType] -= Number(amount);
            });
            return {
                ...prev,
                marketOrder: null,
                inventory: newInventory,
                coins: order.reward.type === 'coins' ? prev.coins + order.reward.amount : prev.coins,
                upgradeCores: order.reward.type === 'upgradeCore' ? prev.upgradeCores + order.reward.amount : prev.upgradeCores,
                coralFragments: order.reward.type === 'coralFragment' ? prev.coralFragments + order.reward.amount : prev.coralFragments,
            };
        });
    };

    const handleContributeToReef = async (amount: number) => {
        if (!user || !playerData || playerData.coralFragments < amount) return;
        
        await runTransaction(db, async transaction => {
            const playerDocRef = doc(db, "players", user.uid);
            transaction.update(playerDocRef, {
                coralFragments: increment(-amount),
                coralReefProgress: increment(amount) // 1 fragment = 1% progress
            });
        });

        setPlayerData(prev => prev ? { ...prev, coralFragments: prev.coralFragments - amount, coralReefProgress: Math.min(100, prev.coralReefProgress + amount) } : null);
    };


    const renderContent = () => {
        if (authInitializing) {
            return <LoadingScreen message={t('initializing')} />;
        }

        switch (gameState) {
            case 'HARBOR':
                return <HarborScreen 
                            user={user} isGuest={isGuest} playerData={playerData} globalStats={globalStats} 
                            onLogout={handleLogout} onStartGame={() => setGameState('COLLECTING')} 
                            onEditProfile={() => setIsEditingProfile(true)} onShowLeaderboard={() => setShowLeaderboard(true)} 
                            onShowDailyRewards={() => setShowDailyRewards(true)} onShowQuests={() => setShowQuests(true)}
                            onShowUpgrades={() => setShowUpgrades(true)} onShowResearch={() => setShowResearch(true)}
                            onShowMarket={() => setShowMarket(true)} onShowCoralReef={() => setShowCoralReef(true)}
                            onShowLoginPrompt={() => setShowLoginPrompt(true)} t={t} language={language} toggleLanguage={toggleLanguage} 
                        />;
            case 'COLLECTING':
                return <TrashCollectingGame onCollectionEnd={handleCollectionEnd} allTrashItems={allTrashItems} t={t} playerData={playerData} />;
            case 'SORTING':
                return <TrashSortingGame initialTrash={collectedTrash || []} onGameEnd={handleSortEnd} t={t} />;
            case 'RESULTS':
                return lastGameResult ? <ResultsScreen {...lastGameResult} onContinue={handleReturnToHarbor} isSaving={isSaving} saveError={saveError} t={t} /> : null;
            case 'TITLE':
            default:
                return <TitleScreen onPlayGuest={handlePlayGuest} onLogin={handleLogin} t={t} language={language} toggleLanguage={toggleLanguage} />;
        }
    };
    
    const isCollecting = gameState === 'COLLECTING';
    const isSorting = gameState === 'SORTING';
    
    return (
        <div className={`w-full h-full relative ${isCollecting ? '' : 'p-4'} ${isSorting ? 'sorting-active' : ''}`}>
            {!(isCollecting || isSorting) && <AnimatedBackground />}
            <div className="relative z-20 w-full h-full">
                {renderContent()}
            </div>
            {((showProfileSetupPopup && user && !isGuest) || isEditingProfile) && user && (
                 <ProfileModal 
                    user={user} onSave={handleProfileSave} 
                    onClose={() => { setShowProfileSetupPopup(false); setIsEditingProfile(false); }}
                    isEditing={isEditingProfile} t={t}
                    onShowCustomization={() => setShowCustomization(true)}
                />
            )}
            {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} t={t} />}
            {showDailyRewards && playerData && !isGuest && (
                <DailyRewardsModal onClose={() => setShowDailyRewards(false)} onClaim={handleClaimDailyReward} playerData={playerData} t={t} />
            )}
             {showQuests && playerData && !isGuest && (
                <QuestsModal onClose={() => setShowQuests(false)} onClaim={handleClaimQuestReward} playerData={playerData} t={t} />
            )}
             {showUpgrades && playerData && !isGuest && (
                <UpgradesModal onClose={() => setShowUpgrades(false)} onUpgrade={handleUpgrade} playerData={playerData} t={t} />
            )}
            {showLoginPrompt && (
                <LoginPromptModal onClose={() => setShowLoginPrompt(false)} onLogin={handleLogin} t={t} />
            )}
            {showResearch && playerData && !isGuest && (
                <ResearchModal onClose={() => setShowResearch(false)} playerData={playerData} t={t} onStart={handleStartResearch} onComplete={handleCompleteResearch} />
            )}
            {showMarket && playerData && !isGuest && (
                <MarketModal onClose={() => setShowMarket(false)} playerData={playerData} t={t} onCraft={handleCraftMarketOrder} />
            )}
            {showCustomization && playerData && !isGuest && (
                <CustomizationModal onClose={() => setShowCustomization(false)} playerData={playerData} t={t} onSave={handleSaveCustomization} />
            )}
            {showCoralReef && playerData && !isGuest && (
                <CoralReefModal onClose={() => setShowCoralReef(false)} playerData={playerData} t={t} onContribute={handleContributeToReef} />
            )}
            {completedQuestsForToast.length > 0 && 
                <QuestCompletionToast quests={completedQuestsForToast} onDone={() => setCompletedQuestsForToast([])} t={t} />
            }
        </div>
    );
};

// --- RENDERER ---
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}

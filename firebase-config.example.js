// Firebase 설정 예시 파일
// 이 파일을 복사하여 js/firebase-config.js로 저장하고 실제 설정값을 입력하세요

const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "sandseekers-XXXXX.firebaseapp.com",
    projectId: "sandseekers-XXXXX",
    storageBucket: "sandseekers-XXXXX.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop",
    measurementId: "G-PF8CX0WT7C"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스들
const auth = firebase.auth();
const db = firebase.firestore();
const analytics = firebase.analytics();

// Google 로그인 제공자 설정
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Google Analytics 이벤트 추적 함수들
function trackEvent(eventName, parameters = {}) {
    try {
        // Firebase Analytics
        if (analytics) {
            analytics.logEvent(eventName, parameters);
        }
        
        // Google Analytics 4 (gtag)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        console.log('Analytics event tracked:', eventName, parameters);
    } catch (error) {
        console.error('Analytics tracking failed:', error);
    }
}

// 게임 이벤트 추적 함수들
function trackGameStart() { trackEvent('game_start'); }
function trackAreaClaimed(areaSize, stoneGained, soilGained) {
    trackEvent('area_claimed', { area_size: areaSize, stone_gained: stoneGained, soil_gained: soilGained });
}
function trackPlanetCreated() { trackEvent('planet_created'); }
function trackResourceCheck(stones, soil) { trackEvent('resource_check', { stones, soil }); }
function trackSessionEnd(playTime, finalStones, finalSoil) {
    trackEvent('session_end', { play_time: playTime, final_stones: finalStones, final_soil: finalSoil });
}
function trackGuestModeStart() { trackEvent('guest_mode_start'); }
function trackGoogleLoginAttempt() { trackEvent('google_login_attempt'); }
function trackGoogleLoginSuccess() { trackEvent('google_login_success'); }
function trackGoogleLoginFailure(error) {
    trackEvent('google_login_failure', { error_code: error.code, error_message: error.message });
}

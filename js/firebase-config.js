// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: "sandseekers-XXXXX.firebaseapp.com",
    projectId: "sandseekers-XXXXX",
    storageBucket: "sandseekers-XXXXX.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdefghijklmnop",
    measurementId: "G-PF8CX0WT7C"
};

// Firebase 초기화 (설정이 유효한 경우에만)
let auth, db, analytics, googleProvider;

try {
    // Firebase가 로드되었는지 확인
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        
        // Firebase 서비스들
        auth = firebase.auth();
        db = firebase.firestore();
        analytics = firebase.analytics();
        
        // Google 로그인 제공자 설정
        googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('profile');
        googleProvider.addScope('email');
        
        console.log('Firebase 초기화 성공');
    } else {
        console.warn('Firebase가 로드되지 않았습니다. 데모 모드로 실행됩니다.');
    }
} catch (error) {
    console.error('Firebase 초기화 실패:', error);
    console.log('데모 모드로 실행됩니다.');
}

// 데모 모드용 더미 함수들
function createDummyAuth() {
    return {
        currentUser: null,
        onAuthStateChanged: (callback) => {
            // 데모 모드에서는 즉시 로그인된 것으로 처리
            setTimeout(() => callback({ uid: 'demo-user', displayName: 'Demo User' }), 100);
        },
        signInWithPopup: () => Promise.resolve({ user: { uid: 'demo-user', displayName: 'Demo User' } }),
        signOut: () => Promise.resolve()
    };
}

function createDummyFirestore() {
    return {
        collection: () => ({
            doc: () => ({
                set: () => Promise.resolve(),
                get: () => Promise.resolve({ exists: false, data: () => ({}) })
            })
        })
    };
}

// Firebase 서비스가 없으면 더미 서비스 사용
if (!auth) auth = createDummyAuth();
if (!db) db = createDummyFirestore();

// Google Analytics 이벤트 추적 함수
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

// 게임 시작 이벤트
function trackGameStart() {
    trackEvent('game_start');
}

// 영역 점유 이벤트
function trackAreaClaimed(areaSize, stoneGained, soilGained) {
    trackEvent('area_claimed', {
        area_size: areaSize,
        stone_gained: stoneGained,
        soil_gained: soilGained
    });
}

// 행성 생성 이벤트
function trackPlanetCreated() {
    trackEvent('planet_created');
}

// 자원 상태 체크 이벤트
function trackResourceCheck(stones, soil) {
    trackEvent('resource_check', {
        stones: stones,
        soil: soil
    });
}

// 세션 종료 이벤트
function trackSessionEnd(playTime, finalStones, finalSoil) {
    trackEvent('session_end', {
        play_time: playTime,
        final_stones: finalStones,
        final_soil: finalSoil
    });
}

// 게스트 모드 시작 이벤트
function trackGuestModeStart() {
    trackEvent('guest_mode_start');
}

// Google 로그인 시도 이벤트
function trackGoogleLoginAttempt() {
    trackEvent('google_login_attempt');
}

// Google 로그인 성공 이벤트
function trackGoogleLoginSuccess() {
    trackEvent('google_login_success');
}

// Google 로그인 실패 이벤트
function trackGoogleLoginFailure(error) {
    trackEvent('google_login_failure', {
        error_code: error.code,
        error_message: error.message
    });
}

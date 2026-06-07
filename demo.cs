using Framework.Core;
using UnityEngine;
using System.Collections.Generic;
using Framework.Services;
using CodeStage.AntiCheat.ObscuredTypes;
using Framework.Events;
using System;
using Framework.Services.Models;
using Framework.Modules;
using CodeStage.AntiCheat.Detectors;
using Framework.Services.Net;
using Framework.Modules.Net;
using System.Threading.Tasks;
#if UNITY_EDITOR
using UnityEditor;
#endif

public class GamePlayModule : GameModule
{
    public const string RunGoalTotalMetersSaveKey = "RUN_GOAL_TOTAL_METERS";
    public const string PlayerMaxHealthSaveKey = "PLAYER_MAX_HEALTH";
    public const string StartLineBombMaxHealthSaveKey = "START_LINE_BOMB_MAX_HEALTH";

    /// <summary>Chỉ dùng cho đếm thắng: còn cách goal ≤ bấy nhiêu mét thì được bắt đầu countdown (vd. 498/500). Track vẫn chạy đủ tới goal.</summary>
    public const float RunGoalReachToleranceMeters = 2f;

    private NetworkService _net;
    private ObscuredInt Coin = 0;
    /// <summary>Tích coin nhặt cho mốc hồi bom (10 → +2 HP), độc lập với reset Coin khi full heal player.</summary>
    private ObscuredInt _bombHealCoinBank = 0;
    /// <summary>Quãng đường dọc track (world ≈ mét), tích phân <see cref="TileManager.CurrentSpeed"/> — dương khi tiến, âm khi lùi.</summary>
    private ObscuredFloat runDistanceMeters = 0f;
    /// <summary>Tổng mét mục tiêu (số nguyên) — UI GoalSlider / TileManager đọc qua <see cref="RunGoalTotalMeters"/>.</summary>
    private int runGoalTotalMeters = 1000;
    bool runGoalReached;

    TileManager _tileManager;
    private ObscuredInt Win = 0;
    private ObscuredInt TotalWin = 5;

    private GameSettings settings;
    private List<ActionData> actions;
    private GiftProcessor giftProcessor;
    private ActionSpawnRegistry _actionRegistry;
    private ObscuredInt totalLike = 0;
    private ObscuredInt totalLikeCountCurrent = 0;
    private ObscuredInt likeTargetTriggeredMilestone = 0;
    private bool likeTargetLiveInitialized = false;
    private AuthModule authModule;
    private bool IsInit = false;
    private bool ShowUI = false;
    private GameConfig gameConfig;
    private ObscuredInt CurrentLevel = 1;
    public ObscuredInt MaxLevel = 1;
    private float countdownDuration = 10f;
    private float goalBacktrackToleranceMeters = 10f;

    [Header("Goal countdown — đích")]
    [Tooltip(
        "Hệ số kéo dài thời gian thật cho các nhịp đếm cuối (số UI = Ceil(countdown)). 2 ≈ giai đoạn 3→0 mất gấp đôi wall time so với đếm đều; 1 = đếm đều như cũ.")]
    [SerializeField]
    float goalCountdownLastSecondsStretch = 2f;

    [Tooltip("Áp chậm khi số hiển thị trên UI ≤ giá trị này (mặc 3 → các nhịp 3, 2, 1).")]
    [SerializeField]
    int goalCountdownSlowWhileDisplayedAtMost = 3;

    private float countdown;
    private bool isCountingDown = false;
    private bool hasWonByGoalCountdown = false;
    private AudioService audioService;
    private int lastCountdownSecond = -1;
    private bool IsPlayBackground = false;
    private InputService inputService;
    private SaveService _saveService;

    DynamicObstacleModule _dynamicObstacleModule;

    /// <summary>Gán trong <see cref="OnStartGame"/> — <see cref="ActionSpawnRegistry"/> spawn obstacle qua đây.</summary>
    public DynamicObstacleModule DynamicObstacleModule => _dynamicObstacleModule;

    public override void OnInitialize()
    {
        _net = ServiceLocator.Get<NetworkService>();
        giftProcessor = new GiftProcessor(OnGiftProcessed);
        EventBus.Subscribe<NetworkMessageReceived>(OnNetworkMessageReceived);
        EventBus.Subscribe<GameSettingsLoaded>(OnGameSettingsLoaded);
        _actionRegistry = new ActionSpawnRegistry(this);
        authModule = GameManager.Instance.GetModule<AuthModule>();
        audioService = ServiceLocator.Get<AudioService>();
        inputService = ServiceLocator.Get<InputService>();
        _saveService = ServiceLocator.Get<SaveService>();



    }

    public void AddCoin(int value)
    {
        Coin += value;

        if (value > 0)
        {
            int coinsPer = 10;
            int healPer = 2;
            if (gameConfig != null)
            {
                coinsPer = Mathf.Max(1, gameConfig.coinsPerBombHeal);
                healPer = Mathf.Max(0, gameConfig.bombHealPerMilestone);
            }

            if (healPer > 0)
            {
                _bombHealCoinBank += value;
                while ((int)_bombHealCoinBank >= coinsPer)
                {
                    _bombHealCoinBank -= coinsPer;
                    StartLineBombHazard.HealActiveBombFromCoinThreshold(healPer);
                }
            }
        }

        int threshold = 1000;
        if (gameConfig != null)
            threshold = Mathf.Max(1, gameConfig.coinsForFullHeal);

        if ((int)Coin >= threshold)
        {
            Coin = 0;
            if (GameManager.Instance != null)
            {
                var pm = GameManager.Instance.GetModule<PlayerModule>();
                pm?.Player?.RefillHealthFull();
            }
        }

        PushRunStatsToUi();
    }

    /// <summary>Coin nhặt trong phiên chơi (UI / HUD).</summary>
    public int RunCoinsCollected => Coin;

    /// <summary>Quãng đường dọc track (m): tăng khi tiến, giảm khi lùi — đồng bộ <see cref="TileManager.CurrentSpeed"/>.</summary>
    public float RunDistanceMeters => runDistanceMeters;

    public float RunGoalTotalMeters => runGoalTotalMeters;
    public GameConfig CurrentGameConfig => gameConfig;

    /// <summary>Mét tối thiểu để được bắt đầu countdown đích (goal − tolerance, clamp). Không dùng để dừng cuộn track.</summary>
    public float RunGoalReachThresholdMeters
    {
        get
        {
            int g = runGoalTotalMeters;
            float t = g - RunGoalReachToleranceMeters;
            return Mathf.Clamp(t, 1f, g);
        }
    }

    /// <summary>Đã chạy đủ <see cref="RunGoalTotalMeters"/> — TileManager dừng track.</summary>
    public bool HasReachedRunGoal => runGoalReached;

    public void SetRunGoalTotalMeters(int meters)
    {
        runGoalTotalMeters = Mathf.Max(1, meters);
        PushRunStatsToUi();
    }

    /// <summary>Menu Apply: cập nhật <see cref="GameConfig"/>, lưu local, áp runtime + refresh UI.</summary>
    public void ApplyRunGoalFromMenu(int meters)
    {
        meters = Mathf.Max(1, meters);
        if (gameConfig == null)
            gameConfig = GameObject.FindAnyObjectByType<GameConfig>();
        if (gameConfig != null)
        {
            gameConfig.runGoalTotalMeters = meters;
#if UNITY_EDITOR
            EditorUtility.SetDirty(gameConfig);
#endif
        }

        _saveService?.Set(RunGoalTotalMetersSaveKey, meters);
        SetRunGoalTotalMeters(meters);
    }

    /// <summary>Menu: lưu máu tối đa player (số nguyên), cập nhật <see cref="GameConfig"/>.</summary>
    public void ApplyPlayerMaxHealthFromMenu(int maxHealth)
    {
        maxHealth = Mathf.Clamp(maxHealth, 1, 99999);
        if (gameConfig == null)
            gameConfig = GameObject.FindAnyObjectByType<GameConfig>();
        if (gameConfig != null)
        {
            gameConfig.playerMaxHealth = maxHealth;
#if UNITY_EDITOR
            EditorUtility.SetDirty(gameConfig);
#endif
        }

        _saveService?.Set(PlayerMaxHealthSaveKey, maxHealth);
    }

    /// <summary>Menu: lưu máu tối đa bom start line, cập nhật <see cref="GameConfig"/>, áp ngay lên <see cref="StartLineBombHazard"/> nếu đang có.</summary>
    public void ApplyStartLineBombMaxHealthFromMenu(int maxHealth)
    {
        maxHealth = Mathf.Clamp(maxHealth, 1, 9_999_999);
        if (gameConfig == null)
            gameConfig = GameObject.FindAnyObjectByType<GameConfig>();
        if (gameConfig != null)
        {
            gameConfig.startLineBombMaxHealth = maxHealth;
#if UNITY_EDITOR
            EditorUtility.SetDirty(gameConfig);
#endif
        }

        _saveService?.Set(StartLineBombMaxHealthSaveKey, maxHealth);
        StartLineBombHazard.ApplyConfiguredMaxHealth(maxHealth);
    }

    int ReadSavedPlayerMaxHealthOrNegative()
    {
        if (_saveService == null)
            return -1;
        int i = _saveService.GetInt(PlayerMaxHealthSaveKey, -1);
        if (i >= 1)
            return i;
        float f = _saveService.GetFloat(PlayerMaxHealthSaveKey, -1f);
        if (f >= 1f)
            return Mathf.RoundToInt(f);
        return -1;
    }

    int ReadSavedStartLineBombMaxHealthOrNegative()
    {
        if (_saveService == null)
            return -1;
        int i = _saveService.GetInt(StartLineBombMaxHealthSaveKey, -1);
        if (i >= 1)
            return i;
        float f = _saveService.GetFloat(StartLineBombMaxHealthSaveKey, -1f);
        if (f >= 1f)
            return Mathf.RoundToInt(f);
        return -1;
    }

    int ReadSavedRunGoalMetersOrNegative()
    {
        if (_saveService == null)
            return -1;
        int i = _saveService.GetInt(RunGoalTotalMetersSaveKey, -1);
        if (i >= 1)
            return i;
        float f = _saveService.GetFloat(RunGoalTotalMetersSaveKey, -1f);
        if (f >= 1f)
            return Mathf.RoundToInt(f);
        return -1;
    }

    public void ResetRunSessionStats()
    {
        Coin = 0;
        _bombHealCoinBank = 0;
        runDistanceMeters = 0f;
        runGoalReached = false;
        hasWonByGoalCountdown = false;
        isCountingDown = false;
        countdown = countdownDuration;
        lastCountdownSecond = -1;
        UIManager.Instance?.HideCountdown();
        PushRunStatsToUi();
    }

    void EnsureTileManager()
    {
        if (_tileManager != null)
            return;
        _tileManager = GameObject.FindAnyObjectByType<TileManager>();
    }

    void TickRunDistance(float dt)
    {
        EnsureTileManager();
        if (_tileManager == null)
            return;

        float v = _tileManager.CurrentSpeed;
        if (Mathf.Approximately(v, 0f))
            return;

        float cur = (float)runDistanceMeters;
        float next = cur + v * dt;

        if (v > 0f)
        {
            if (runGoalReached)
                return;
            if (next >= runGoalTotalMeters)
            {
                runDistanceMeters = runGoalTotalMeters;
                runGoalReached = true;
            }
            else
                runDistanceMeters = next;
        }
        else
        {
            runDistanceMeters = Mathf.Max(0f, next);
            if ((float)runDistanceMeters < runGoalTotalMeters)
                runGoalReached = false;
        }
    }

    void PushRunStatsToUi()
    {
        if (UIManager.Instance == null)
            return;
        UIManager.Instance.UpdateRunStats(
            (float)runDistanceMeters,
            runGoalTotalMeters,
            (int)Coin);
    }

    private void OnCheatDetected(string reason)
    {
        authModule.CrashNow();
    }
    public async void ShowUIDelay()
    {

        // await Task.Delay(1000);

    }
    private void OnGameSettingsLoaded(GameSettingsLoaded data)
    {
        GameSettingData s = data.Settings;
        if (s == null)
        {
            Debug.LogWarning("[GamePlay] GameSettingsLoaded: Settings null — default mock.");
            s = GameSettingData.CreateDefaultMock();
        }
        else
            GameSettingData.EnsureConsistent(s);

        //  DebugUtil.LogObject(data);
        if (!ShowUI)
            ShowUIDelay();

        settings = s.settings;
        actions = s.actions;

        // totalLikeCount chỉ nhận từ LikeMessage.HandleLike (không nhận từ settings backend).
        totalLikeCountCurrent = 0;
        likeTargetTriggeredMilestone = 0;
        likeTargetLiveInitialized = false;

        // currentWin
        if (settings?.currentWin != null)
            Win = settings.currentWin.number;


        // total win
        if (settings?.win != null)
            TotalWin = settings.win.number;
        UIManager.Instance.UpdateWin(Win, TotalWin);
        if (TotalWin > 0)
        {
            UIManager.Instance.SetShowWin(true);
        }
        else
        {
            UIManager.Instance.SetShowWin(false);
        }
    }
    private void OnNetworkMessageReceived(NetworkMessageReceived msg)
    {

        switch (msg.Type)
        {
            case "gift":
                HandleGift(msg.Data as GiftMessage);
                break;

            case "like":
                HandleLike(msg.Data as LikeMessage);
                break;

            case "join":
                HandleJoin(msg.Data as MemberMessage);
                break;

            case "follow":
                HandleFollow(msg.Data as FollowMessage);
                break;
            case "share":
                HandleShare(msg.Data as ShareMessage);
                break;
            case "game_execute_action":

                var actionData = msg.Data as GameExecuteActionData;
                if (actionData != null)
                    HandleGameAction(actionData);


                break;
            case "update_settings":
                if (_net != null)
                    _net.GetGameSettings();
                break;
        }
    }
    public override void OnUpdate(float dt)
    {
        if (inputService != null)
            inputService.Tick();

        HandleWinDebugHotkeys();
        TickRunDistance(dt);
        TickGoalCountdown(dt);
        PushRunStatsToUi();
    }

    void HandleWinDebugHotkeys()
    {
        if (GameManager.Instance == null || !GameManager.Instance.StateMachine.Is(GameState.Playing))
            return;

        // Keyboard quick test: '=' / '+' tăng 1 win, '-' giảm 1 win.
        if (Input.GetKeyDown(KeyCode.Equals) || Input.GetKeyDown(KeyCode.KeypadPlus))
        {
            Win += 1;
            UIManager.Instance?.UpdateWin(Win, TotalWin);
        }

        if (Input.GetKeyDown(KeyCode.Minus) || Input.GetKeyDown(KeyCode.KeypadMinus))
        {
            Win -= 1;
            UIManager.Instance?.UpdateWin(Win, TotalWin);
        }
    }

    private void HandleGameAction(GameExecuteActionData gameExecuteAction)
    {
        _dynamicObstacleModule?.GrantSpawnTickets(3, 0.6f);
        if (!_actionRegistry.TryExecute(gameExecuteAction))
        {
            Debug.LogWarning(
                $"[GamePlay] Unknown actionId {gameExecuteAction.actionId}"
            );
        }
    }

    private void HandleShare(ShareMessage shareMessage)
    {
        if (settings == null) return;
        int value;
        if (int.TryParse(settings?.share?.action, out value))
        {
            if (value > 0)
                excuteAction(new GameExecuteActionData() { actionId = value, number = settings.share.amount, units = 1, userInfo = new UserInfo(shareMessage.nickname, shareMessage.avatar) });
        }
        else
        {
            // Debug.Log("no selected");
        }
    }

    private void HandleFollow(FollowMessage followMessage)
    {
        if (settings == null) return;
        int value;
        if (int.TryParse(settings?.follow?.action, out value))
        {
            if (value > 0)
                excuteAction(new GameExecuteActionData() { actionId = value, number = settings.follow.amount, units = 1, userInfo = new UserInfo(followMessage.nickname, followMessage.avatar) });
        }
        else
        {
            // Debug.Log("no selected");
        }
    }

    private void HandleJoin(MemberMessage memberMessage)
    {

        if (settings == null) return;
        int value;
        if (int.TryParse(settings?.join?.action, out value))
        {
            if (value > 0)
                excuteAction(new GameExecuteActionData() { actionId = value, number = settings.join.amount, units = 1, userInfo = new UserInfo(memberMessage.nickname, memberMessage.avatar) });
        }
        else
        {
            // Debug.Log("no selected");
        }
    }

    private void HandleLike(LikeMessage likeMessage)
    {
        if (settings == null) return;

        // ---- Like target theo totalLikeCount lũy tiến ----
        int totalIncoming = Mathf.Max(0, likeMessage.totalLikeCount);
        if (totalIncoming > (int)totalLikeCountCurrent)
            totalLikeCountCurrent = totalIncoming;

        int targetStep = settings?.likeTarget?.number ?? 0;
        if (targetStep > 0)
        {
            int currentMilestone = Mathf.Max(0, totalIncoming / targetStep);
            int lastMilestone = Mathf.Max(0, (int)likeTargetTriggeredMilestone);

            // Không hồi tố mốc đã đạt trong quá khứ:
            // lần like live đầu tiên chỉ "neo" baseline theo totalLikeCount hiện tại.
            if (!likeTargetLiveInitialized)
            {
                likeTargetLiveInitialized = true;
                likeTargetTriggeredMilestone = currentMilestone;
                // Không trigger action ở lần init baseline.
                currentMilestone = likeTargetTriggeredMilestone;
                lastMilestone = likeTargetTriggeredMilestone;
            }

            if (currentMilestone > lastMilestone)
            {
                int value;
                bool hasAction = int.TryParse(settings?.likeTarget?.action, out value) && value > 0;
                int amount = Mathf.Max(1, settings?.likeTarget?.amount ?? 1);

                // Chỉ tính target hiện tại, không cộng dồn các mốc đã lướt qua.
                int triggerCount = 1;
                if (hasAction)
                {
                    for (int i = 0; i < triggerCount; i++)
                    {
                        excuteAction(new GameExecuteActionData()
                        {
                            actionId = value,
                            number = amount,
                            units = 1,
                            userInfo = new UserInfo(likeMessage.nickname, likeMessage.avatar)
                        });
                    }
                }
                else
                {
                    // Action không hợp lệ => bỏ qua.
                }

                // Nhảy thẳng baseline lên mốc hiện tại để bỏ qua toàn bộ mốc quá khứ.
                likeTargetTriggeredMilestone = currentMilestone;
            }
        }

        // ---- Like thường theo likeCount cộng dồn ngắn hạn (logic cũ) ----
        totalLike += likeMessage.likeCount;
        int targetLike = settings?.like?.number ?? 0;
        if (targetLike <= 0)
            return;
        if (totalLike >= targetLike)
        {
            int value;
            if (int.TryParse(settings?.like?.action, out value))
            {
                excuteAction(new GameExecuteActionData() { actionId = value, number = settings.like.amount, units = 1, userInfo = new UserInfo(likeMessage.nickname, likeMessage.avatar) });
            }
            else
            {
                // Debug.Log("no selected");
            }

            totalLike = 0;
        }
    }

    private void HandleGift(GiftMessage giftMessage)
    {
        giftProcessor.HandleGift(giftMessage);
    }

    private void OnGiftProcessed(GiftMessage gift)
    {
        if (actions == null || actions.Count == 0) return;
        List<ActionData> matchedActions = actions.FindAll(a => a.giftId == gift.giftId);

        if (matchedActions.Count > 0)
        {
            foreach (var action in matchedActions)
            {
                excuteAction(new GameExecuteActionData() { actionId = action.actionId, number = action.number, units = action.units, userInfo = new UserInfo(gift.nickname, gift.avatar) });
            }
        }
        else
        {
        }
    }
    public void SetMaxLevel(int level)
    {
        MaxLevel = level;
        CurrentLevel = 1;

        Debug.Log($"[GamePlay] Set MaxLevel = {MaxLevel}");

    }

    public override void OnRestartGame()
    {
        UIManager.Instance.SetShowEndGame(false);
        _tileManager = null;
        ResetRunSessionStats();
    }
    public override void OnStartGame()
    {
        _tileManager = null;
        ResetRunSessionStats();

        if (GameManager.Instance != null)
            _dynamicObstacleModule = GameManager.Instance.GetModule<DynamicObstacleModule>();

        gameConfig = GameObject.FindAnyObjectByType<GameConfig>();
        int baseGoal = Mathf.Max(1, runGoalTotalMeters);
        if (gameConfig != null)
        {
            var pool = ServiceLocator.Get<ObjectPoolService>();
            pool.setPoolRoot(gameConfig.PoolRoot);
            baseGoal = Mathf.Max(1, gameConfig.runGoalTotalMeters);
        }

        SetRunGoalTotalMeters(baseGoal);
        int savedGoal = ReadSavedRunGoalMetersOrNegative();
        if (savedGoal >= 1)
            SetRunGoalTotalMeters(savedGoal);

        int savedHp = ReadSavedPlayerMaxHealthOrNegative();
        if (savedHp >= 1 && gameConfig != null)
            gameConfig.playerMaxHealth = savedHp;

        int savedBombMax = ReadSavedStartLineBombMaxHealthOrNegative();
        if (savedBombMax >= 1 && gameConfig != null)
            gameConfig.startLineBombMaxHealth = savedBombMax;
        int bombMaxHp = Mathf.Max(1, gameConfig != null ? gameConfig.startLineBombMaxHealth : 1000);
        StartLineBombHazard.ApplyConfiguredMaxHealth(bombMaxHp);

        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        // if (!IsPlayBackground)
        // {
        //     audioService.PlayLoop("background", 0.5f);
        //     IsPlayBackground = true;
        // }

    }

    public void WinGame()
    {
        Win += 1;
        UIManager.Instance.UpdateWin(Win, TotalWin);

    }
    public void SetWin(int number)
    {
        Win += number;
        UIManager.Instance.UpdateWin(Win, TotalWin);
    }
    public void StartCountdown()
    {
        // Tránh kẹt trạng thái phiên trước (đếm về 0 nhưng chưa win / chưa reset sạch).
        hasWonByGoalCountdown = false;
        countdown = countdownDuration;
        isCountingDown = true;
        lastCountdownSecond = -1;
        UIManager.Instance?.ShowCountdown();
        int sec = Mathf.CeilToInt(countdown);
        lastCountdownSecond = sec;
        UIManager.Instance?.UpdateCountdown(sec);
        if (sec > 0)
            audioService?.PlaySFX("ding",0.7f);
    }
    public void CancelCountdown()
    {
        if (!isCountingDown) return;

        isCountingDown = false;
        lastCountdownSecond = -1;

        UIManager.Instance?.HideCountdown();
    }

    void TickGoalCountdown(float dt)
    {
        if (hasWonByGoalCountdown)
            return;

        float cur = (float)runDistanceMeters;
        float goal = Mathf.Max(1f, runGoalTotalMeters);
        float reachTh = RunGoalReachThresholdMeters;
        // Countdown được bật sớm (còn ≤ tolerance m); dừng track / HasReachedRunGoal vẫn theo đủ goal.
        bool canStartGoalCountdown = cur >= reachTh;
        bool inGoalSafeZone = cur >= goal - Mathf.Max(0f, goalBacktrackToleranceMeters);

        if (!isCountingDown)
        {
            if (canStartGoalCountdown)
                StartCountdown();
            return;
        }

        // Đang đếm: chỉ hủy khi bị đẩy lùi quá vùng an toàn (vd. goal=400, <390 thì hủy).
        if (!inGoalSafeZone)
        {
            CancelCountdown();
            return;
        }

        float stretch = Mathf.Max(1f, goalCountdownLastSecondsStretch);
        int slowWhile = Mathf.Max(1, goalCountdownSlowWhileDisplayedAtMost);
        bool inSlowFinish =
            countdown > 0f && Mathf.CeilToInt(countdown) <= slowWhile;
        float step = Mathf.Max(0f, dt);
        if (inSlowFinish && stretch > 1f)
            step /= stretch;

        countdown -= step;
        int sec = Mathf.Max(0, Mathf.CeilToInt(countdown));
        if (sec != lastCountdownSecond)
        {
            lastCountdownSecond = sec;
            UIManager.Instance?.UpdateCountdown(sec);
            if (sec > 0)
                audioService?.PlaySFX("ding",0.7f);
        }

        if (countdown > 0f)
            return;

        // Đếm xong: cần đủ mét goal; runGoalReached = đã khóa theo goal; epsilon tránh lệch float / sync frame.
        const float goalWinDistanceEpsilon = 0.35f;
        bool distanceOk = runGoalReached || cur + goalWinDistanceEpsilon >= goal;
        if (!distanceOk)
            return;

        isCountingDown = false;
        hasWonByGoalCountdown = true;
        UIManager.Instance?.HideCountdown();
        audioService?.PlaySFX("cheer",0.7f);
        WinGame();
        UIManager.Instance?.SetShowEndGame(true, EndGameReason.LevelComplete);
    }
    private bool excuteAction(GameExecuteActionData gameExecuteAction)
    {
        // if (!WebSocketProcessingScope.Validate(gameExecuteAction.RuntimeToken))
        //     return false;

        _dynamicObstacleModule?.GrantSpawnTickets(3, 0.6f);
        if (!_actionRegistry.TryExecute(gameExecuteAction))
        {
            Debug.LogWarning(
                $"[GamePlay] Unknown actionId {gameExecuteAction.actionId}"
            );
            return false;
        }

        return true;
    }

    /// <summary>
    /// Gift ± Win — <paramref name="sign"/> −1 (trừ) hoặc +1 (cộng). Dùng với <see cref="ActionSpawnRegistry"/> actionId 14 / 15.
    /// </summary>
    public void ExecuteActionWinDelta(GameExecuteActionData data, int sign)
    {
        int n = data != null ? Mathf.Max(1, data.number) : 1;
        Win += sign * n;
        UIManager.Instance?.UpdateWin(Win, TotalWin);
    }

    /// <summary>
    /// Action reset: về trạng thái bắt đầu lượt chơi (quãng đường 0m, player/tile/module reset như RestartGame).
    /// </summary>
    public void ExecuteActionResetPlayerToStart(GameExecuteActionData _)
    {
        if (GameManager.Instance == null)
            return;
        GameManager.Instance.RestartGame();
    }


}

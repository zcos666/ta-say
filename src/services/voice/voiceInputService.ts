export type VoiceInputStatus =
  | "idle"
  | "checking"
  | "listening"
  | "processing"
  | "success"
  | "fallback"
  | "unsupported"
  | "error";

export type VoiceInputSource = "web_speech" | "preset";

export interface VoiceInputPresetOption {
  id: string;
  text: string;
  label?: string;
}

export interface VoiceInputState {
  status: VoiceInputStatus;
  activeSource: VoiceInputSource | null;
  transcript: string;
  errorMessage: string | null;
  isSupported: boolean;
  isListening: boolean;
  presetOptions: VoiceInputPresetOption[];
  updatedAt: number;
}

export interface VoiceInputSuccessResult {
  kind: "success";
  source: VoiceInputSource;
  transcript: string;
}

export interface VoiceInputFallbackResult {
  kind: "fallback";
  source: "preset";
  reason: string;
  options: VoiceInputPresetOption[];
}

export interface VoiceInputCancelledResult {
  kind: "cancelled";
  source: null;
  reason: string;
}

export type VoiceInputResult =
  | VoiceInputSuccessResult
  | VoiceInputFallbackResult
  | VoiceInputCancelledResult;

export type VoiceInputStateListener = (state: VoiceInputState) => void;

export interface VoiceInputServiceOptions {
  lang?: string;
  presetOptions?: VoiceInputPresetOption[];
  forcePresetFallback?: boolean;
  createRecognition?: () => BrowserSpeechRecognition | null;
}

export interface VoiceInputService {
  getState: () => VoiceInputState;
  subscribe: (listener: VoiceInputStateListener) => () => void;
  getPresetOptions: () => VoiceInputPresetOption[];
  startListening: () => Promise<VoiceInputResult>;
  usePreset: (option: string | VoiceInputPresetOption) => VoiceInputSuccessResult;
  stopListening: () => void;
  cancelListening: () => void;
  reset: () => void;
  destroy: () => void;
}

type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "phrases-not-supported"
  | "service-not-allowed";

interface BrowserSpeechRecognitionAlternative {
  transcript: string;
  confidence?: number;
}

interface BrowserSpeechRecognitionResult {
  [index: number]: BrowserSpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: ArrayLike<BrowserSpeechRecognitionResult>;
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionErrorCode | string;
  message?: string;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: ((this: BrowserSpeechRecognition, event: Event) => void) | null;
  onerror: ((this: BrowserSpeechRecognition, event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: BrowserSpeechRecognition, event: BrowserSpeechRecognitionEvent) => void) | null;
  onspeechend: ((this: BrowserSpeechRecognition, event: Event) => void) | null;
  onstart: ((this: BrowserSpeechRecognition, event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

type BrowserSpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  };

const DEFAULT_LANG = "zh-CN";

export const DEFAULT_VOICE_PRESET_OPTIONS: VoiceInputPresetOption[] = [
  { id: "preset-busy", text: "没事，你忙吧。" },
  { id: "preset-too-fast", text: "我觉得我们是不是太快了。" },
  { id: "preset-afraid", text: "我有点害怕。" },
  { id: "preset-who-are-you", text: "你到底是谁？" },
  { id: "preset-exit", text: "我想退出。" },
];

export const voiceInputServiceUsage = {
  summary: "优先尝试浏览器 Web Speech API；若浏览器不支持、权限受限或识别失败，则切换到预设文本选择。",
  steps: [
    "页面初始化时读取 getState()，并用 subscribe() 监听按钮文案、错误提示与转写结果。",
    "用户点击语音按钮后调用 startListening()。",
    "若返回 kind === 'success'，把 transcript 回填到输入框。",
    "若返回 kind === 'fallback'，展示 getPresetOptions() 返回的预设文本，并在用户选择后调用 usePreset()。",
    "页面卸载时调用 destroy()，避免遗留事件监听和未完成识别实例。",
  ],
  statusHints: {
    idle: "待机状态，可直接开始录音或显示默认按钮。",
    checking: "正在初始化浏览器语音能力，适合显示“准备中”。",
    listening: "正在收音，可显示“正在听...”。",
    processing: "浏览器已结束收音，正在整理识别结果。",
    success: "拿到文本结果，可回填输入框并等待用户确认发送。",
    fallback: "当前已切换到预设文本模式，应展示预设选项。",
    unsupported: "当前环境不支持 Web Speech API，建议默认展示预设选项。",
    error: "出现不可恢复错误，应提示用户重试或改用预设文本。",
  },
} as const;

const speechErrorMessages: Record<string, string> = {
  "audio-capture": "没有检测到可用麦克风，已切换为预设文本。",
  "bad-grammar": "语音识别语法配置异常，已切换为预设文本。",
  "language-not-supported": "当前浏览器不支持所选识别语言，已切换为预设文本。",
  network: "语音识别网络异常，已切换为预设文本。",
  "no-speech": "没有识别到清晰语音，已切换为预设文本。",
  "not-allowed": "麦克风权限被拒绝，已切换为预设文本。",
  "phrases-not-supported": "当前环境不支持该语音短语能力，已切换为预设文本。",
  "service-not-allowed": "当前环境不允许使用语音识别服务，已切换为预设文本。",
};

const clonePresetOptions = (presetOptions: VoiceInputPresetOption[]) =>
  presetOptions.map((option) => ({ ...option }));

const getRecognitionConstructor = (): BrowserSpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const speechWindow = window as BrowserSpeechWindow;
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

const createBrowserRecognition = (): BrowserSpeechRecognition | null => {
  const Recognition = getRecognitionConstructor();
  return Recognition ? new Recognition() : null;
};

const getSpeechErrorMessage = (error: string, detail?: string) => {
  if (speechErrorMessages[error]) {
    return speechErrorMessages[error];
  }

  if (detail && detail.trim()) {
    return `语音识别失败：${detail.trim()}，已切换为预设文本。`;
  }

  return "语音识别失败，已切换为预设文本。";
};

const extractTranscript = (event: BrowserSpeechRecognitionEvent) => {
  const transcript = Array.from(event.results)
    .slice(event.resultIndex)
    .map((result) => {
      const alternative = result[0];
      return alternative?.transcript?.trim() ?? "";
    })
    .join("")
    .trim();

  return transcript;
};

const createState = (
  state: Partial<VoiceInputState>,
  presetOptions: VoiceInputPresetOption[],
  isSupported: boolean,
): VoiceInputState => ({
  status: "idle",
  activeSource: null,
  transcript: "",
  errorMessage: null,
  isSupported,
  isListening: false,
  presetOptions: clonePresetOptions(presetOptions),
  updatedAt: Date.now(),
  ...state,
});

export const createVoiceInputService = (
  options: VoiceInputServiceOptions = {},
): VoiceInputService => {
  const presetOptions = clonePresetOptions(
    options.presetOptions ?? DEFAULT_VOICE_PRESET_OPTIONS,
  );
  const createRecognition = options.createRecognition ?? createBrowserRecognition;
  const isSupported = !options.forcePresetFallback && createRecognition() !== null;

  const listeners = new Set<VoiceInputStateListener>();
  let state = createState({}, presetOptions, isSupported);
  let activeRecognition: BrowserSpeechRecognition | null = null;
  let pendingTask: Promise<VoiceInputResult> | null = null;
  let didCancel = false;
  let settlePendingTask:
    | ((result: VoiceInputResult, nextState?: Partial<VoiceInputState>) => void)
    | null = null;

  const emit = (nextState: Partial<VoiceInputState>) => {
    state = createState({ ...state, ...nextState }, presetOptions, isSupported);
    listeners.forEach((listener) => listener(state));
  };

  const buildFallbackResult = (reason: string): VoiceInputFallbackResult => ({
    kind: "fallback",
    source: "preset",
    reason,
    options: clonePresetOptions(presetOptions),
  });

  const openFallback = (reason: string, status: VoiceInputStatus): VoiceInputFallbackResult => {
    emit({
      status,
      activeSource: "preset",
      errorMessage: reason,
      isListening: false,
    });

    return buildFallbackResult(reason);
  };

  const cleanupRecognition = () => {
    if (!activeRecognition) {
      return;
    }

    activeRecognition.onstart = null;
    activeRecognition.onspeechend = null;
    activeRecognition.onresult = null;
    activeRecognition.onerror = null;
    activeRecognition.onend = null;
    activeRecognition = null;
  };

  const reset = () => {
    if (activeRecognition && settlePendingTask) {
      didCancel = true;
      activeRecognition.abort();
      settlePendingTask(
        {
          kind: "cancelled",
          source: null,
          reason: "语音输入已取消。",
        },
        {
          status: "idle",
          activeSource: null,
          transcript: "",
          errorMessage: null,
          isListening: false,
        },
      );
      return;
    }

    cleanupRecognition();
    pendingTask = null;
    didCancel = false;
    settlePendingTask = null;
    emit({
      status: "idle",
      activeSource: null,
      transcript: "",
      errorMessage: null,
      isListening: false,
    });
  };

  const usePreset = (option: string | VoiceInputPresetOption): VoiceInputSuccessResult => {
    const matchedOption =
      typeof option === "string"
        ? presetOptions.find(
            (preset) => preset.id === option || preset.text === option,
          )
        : presetOptions.find((preset) => preset.id === option.id) ?? option;

    if (!matchedOption) {
      throw new Error("所选预设文本不存在，无法回填语音输入结果。");
    }

    const result: VoiceInputSuccessResult = {
      kind: "success",
      source: "preset",
      transcript: matchedOption.text,
    };

    emit({
      status: "success",
      activeSource: "preset",
      transcript: matchedOption.text,
      errorMessage: null,
      isListening: false,
    });

    return result;
  };

  const startListening = async (): Promise<VoiceInputResult> => {
    if (pendingTask) {
      return pendingTask;
    }

    if (options.forcePresetFallback) {
      return openFallback("当前环境已配置为仅使用预设文本。", "fallback");
    }

    const recognition = createRecognition();
    if (!recognition) {
      return openFallback("当前浏览器不支持 Web Speech API，请改用预设文本。", "unsupported");
    }

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = options.lang ?? DEFAULT_LANG;
    recognition.maxAlternatives = 1;

    didCancel = false;
    emit({
      status: "checking",
      activeSource: "web_speech",
      transcript: "",
      errorMessage: null,
      isListening: false,
    });

    pendingTask = new Promise<VoiceInputResult>((resolve) => {
      let settled = false;

      const settle = (result: VoiceInputResult, nextState?: Partial<VoiceInputState>) => {
        if (settled) {
          return;
        }

        settled = true;
        pendingTask = null;

        if (nextState) {
          emit(nextState);
        }

        settlePendingTask = null;
        cleanupRecognition();
        resolve(result);
      };

      settlePendingTask = settle;

      recognition.onstart = () => {
        emit({
          status: "listening",
          activeSource: "web_speech",
          errorMessage: null,
          isListening: true,
        });
      };

      recognition.onspeechend = () => {
        emit({
          status: "processing",
          activeSource: "web_speech",
          isListening: false,
        });
      };

      recognition.onresult = (event) => {
        const transcript = extractTranscript(event);

        if (!transcript) {
          const reason = "没有识别到有效语音内容，已切换为预设文本。";
          settle(buildFallbackResult(reason), {
            status: "fallback",
            activeSource: "preset",
            errorMessage: reason,
            isListening: false,
          });
          return;
        }

        const result: VoiceInputSuccessResult = {
          kind: "success",
          source: "web_speech",
          transcript,
        };

        settle(result, {
          status: "success",
          activeSource: "web_speech",
          transcript,
          errorMessage: null,
          isListening: false,
        });
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted" && didCancel) {
          settle(
            {
              kind: "cancelled",
              source: null,
              reason: "语音输入已取消。",
            },
            {
              status: "idle",
              activeSource: null,
              isListening: false,
            },
          );
          return;
        }

        const reason = getSpeechErrorMessage(event.error, event.message);
        settle(buildFallbackResult(reason), {
          status: "fallback",
          activeSource: "preset",
          errorMessage: reason,
          isListening: false,
        });
      };

      recognition.onend = () => {
        if (settled) {
          return;
        }

        if (didCancel) {
          settle(
            {
              kind: "cancelled",
              source: null,
              reason: "语音输入已取消。",
            },
            {
              status: "idle",
              activeSource: null,
              isListening: false,
            },
          );
          return;
        }

        const reason = "语音输入已结束，但没有返回有效文本。";
        settle(buildFallbackResult(reason), {
          status: "fallback",
          activeSource: "preset",
          errorMessage: reason,
          isListening: false,
        });
      };

      try {
        activeRecognition = recognition;
        recognition.start();
      } catch (error) {
        const reason =
          error instanceof Error
            ? `麦克风启动失败：${error.message}，已切换为预设文本。`
            : "麦克风启动失败，已切换为预设文本。";
        settle(buildFallbackResult(reason), {
          status: "fallback",
          activeSource: "preset",
          errorMessage: reason,
          isListening: false,
        });
      }
    });

    return pendingTask;
  };

  const stopListening = () => {
    if (!activeRecognition) {
      return;
    }

    activeRecognition.stop();
  };

  const cancelListening = () => {
    if (!activeRecognition) {
      return;
    }

    didCancel = true;
    activeRecognition.abort();
  };

  const subscribe = (listener: VoiceInputStateListener) => {
    listeners.add(listener);
    listener(state);

    return () => {
      listeners.delete(listener);
    };
  };

  const destroy = () => {
    reset();
    listeners.clear();
  };

  return {
    getState: () => ({ ...state, presetOptions: clonePresetOptions(presetOptions) }),
    subscribe,
    getPresetOptions: () => clonePresetOptions(presetOptions),
    startListening,
    usePreset,
    stopListening,
    cancelListening,
    reset,
    destroy,
  };
};

export const voiceInputService = createVoiceInputService();

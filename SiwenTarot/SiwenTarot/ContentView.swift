import SwiftUI
import WebKit

struct ContentView: View {
    @StateObject private var webModel = TarotWebModel()

    var body: some View {
        ZStack(alignment: .bottom) {
            TarotWebView(model: webModel)
                .ignoresSafeArea()

            NativeTabBar(activeTab: $webModel.activeTab) { tab in
                webModel.switchTo(tab)
            }
        }
        .background(Color.black)
    }
}

final class TarotWebModel: ObservableObject {
    @Published var activeTab: TarotTab = .home
    weak var webView: WKWebView?

    func switchTo(_ tab: TarotTab) {
        activeTab = tab
        let view = tab.rawValue
        let script = """
        (function() {
            var view = "\(view)";
            var usedAppSwitch = false;

            var reading = document.getElementById("readingSheet");
            if (reading) {
                reading.classList.remove("open");
                reading.setAttribute("aria-hidden", "true");
            }

            var deck = document.getElementById("deckStage");
            if (deck) {
                deck.hidden = true;
                deck.classList.remove("active");
            }

            document.querySelectorAll(".app-view").forEach(function(panel) {
                var active = panel.dataset.view === view;
                panel.hidden = !active;
                panel.classList.toggle("active", active);
                if (active && panel.classList.contains("exit")) {
                    panel.classList.remove("exit");
                }
                if (active && panel.scrollTo) {
                    panel.scrollTo({ top: 0, behavior: "smooth" });
                }
            });

            document.querySelectorAll("[data-nav]").forEach(function(button) {
                button.classList.toggle("active", button.dataset.nav === view);
            });

            if (view === "library" && window.renderLibrary) {
                window.renderLibrary();
            }
            if (view === "profile" && window.loadApiSettings) {
                window.loadApiSettings();
            }
            if (window.siwenSwitchView) {
                usedAppSwitch = true;
                window.siwenSwitchView(view);
            }

            return (usedAppSwitch ? "dom+app:" : "dom:") + view + ":cards=" + document.querySelectorAll(".library-card").length;
        })();
        """
        webView?.evaluateJavaScript(script) { result, error in
            if let error {
                print("Siwen native tab switch failed: \(error.localizedDescription)")
            } else if let result {
                print("Siwen native tab switch: \(result)")
            }
        }
    }
}

enum TarotTab: String, CaseIterable, Identifiable {
    case home
    case library
    case daily
    case profile

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: "首页"
        case .library: "牌库"
        case .daily: "日签"
        case .profile: "我的"
        }
    }

    var symbol: String {
        switch self {
        case .home: "house.fill"
        case .library: "rectangle.stack.fill"
        case .daily: "sparkles"
        case .profile: "person.crop.circle"
        }
    }
}

struct NativeTabBar: View {
    @Binding var activeTab: TarotTab
    let onSelect: (TarotTab) -> Void

    var body: some View {
        HStack(spacing: 0) {
            ForEach(TarotTab.allCases) { tab in
                Button {
                    onSelect(tab)
                } label: {
                    VStack(spacing: 5) {
                        Image(systemName: tab.symbol)
                            .font(.system(size: 19, weight: .semibold))
                            .frame(width: 34, height: 28)
                        Text(tab.title)
                            .font(.system(size: 12, weight: .medium))
                    }
                    .frame(maxWidth: .infinity, minHeight: 58)
                    .foregroundStyle(activeTab == tab ? Color(red: 1.0, green: 0.88, blue: 0.63) : Color.white.opacity(0.46))
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 18)
        .padding(.top, 10)
        .padding(.bottom, 10)
        .background(
            ZStack {
                Color(red: 0.03, green: 0.04, blue: 0.035).opacity(0.9)
                LinearGradient(
                    colors: [
                        Color(red: 1.0, green: 0.88, blue: 0.63).opacity(0.16),
                        Color.clear
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
            }
            .ignoresSafeArea(edges: .bottom)
        )
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Color(red: 1.0, green: 0.88, blue: 0.63).opacity(0.18))
                .frame(height: 1)
        }
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .shadow(color: .black.opacity(0.48), radius: 24, x: 0, y: -12)
        .padding(.horizontal, 0)
    }
}

struct TarotWebView: UIViewRepresentable {
    @ObservedObject var model: TarotWebModel

    func makeCoordinator() -> Coordinator {
        Coordinator(model: model)
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.userContentController.add(context.coordinator, name: "deepseek")
        configuration.userContentController.add(context.coordinator, name: "deepseekStream")
        configuration.userContentController.addUserScript(WKUserScript(
            source: "document.documentElement.classList.add('ios-native-shell');",
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        ))

        let webView = WKWebView(frame: .zero, configuration: configuration)
        context.coordinator.webView = webView
        model.webView = webView
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = false
        loadTarotApp(in: webView)
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    private func loadTarotApp(in webView: WKWebView) {
        guard let indexURL = Bundle.main.url(
            forResource: "index",
            withExtension: "html",
            subdirectory: "tarot-ritual"
        ) else {
            webView.loadHTMLString("<html><body style='background:#070909;color:#f7eedc;font:17px -apple-system;padding:24px'>思文塔罗资源缺失。</body></html>", baseURL: nil)
            return
        }

        let folderURL = indexURL.deletingLastPathComponent()
        webView.loadFileURL(indexURL, allowingReadAccessTo: folderURL)
    }

    final class Coordinator: NSObject, WKScriptMessageHandler {
        weak var webView: WKWebView?
        private weak var model: TarotWebModel?
        private var streamDelegates: [String: StreamDelegate] = [:]

        init(model: TarotWebModel) {
            self.model = model
        }

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "deepseek" || message.name == "deepseekStream",
                  let payload = message.body as? [String: Any],
                  let id = payload["id"] as? String,
                  let apiKey = payload["apiKey"] as? String,
                  let baseURLString = payload["baseURL"] as? String,
                  let url = URL(string: baseURLString),
                  let model = payload["model"] as? String,
                  let messages = payload["messages"] as? [[String: String]] else {
                return
            }
            let temperature = payload["temperature"] as? Double ?? 0.28
            let maxTokens = payload["maxTokens"] as? Int ?? 4200
            let shouldStream = message.name == "deepseekStream"

            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
            request.httpBody = try? JSONSerialization.data(withJSONObject: [
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": maxTokens,
                "stream": shouldStream
            ])

            if shouldStream {
                let delegate = StreamDelegate(id: id, webView: webView) { [weak self] finishedID in
                    self?.streamDelegates[finishedID] = nil
                }
                streamDelegates[id] = delegate
                URLSession(configuration: .default, delegate: delegate, delegateQueue: nil).dataTask(with: request).resume()
                return
            }

            URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
                var result: [String: Any] = ["id": id]

                if let error {
                    result["error"] = error.localizedDescription
                } else if let http = response as? HTTPURLResponse, !(200..<300).contains(http.statusCode) {
                    result["error"] = "DeepSeek \(http.statusCode)"
                } else if let data,
                          let json = try? JSONSerialization.jsonObject(with: data) {
                    result["data"] = json
                } else {
                    result["error"] = "Empty DeepSeek response"
                }

                guard let encoded = try? JSONSerialization.data(withJSONObject: result),
                      let jsonString = String(data: encoded, encoding: .utf8) else {
                    return
                }

                DispatchQueue.main.async {
                    self?.webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('deepseek-response', { detail: \(jsonString) }));")
                }
            }.resume()
        }

        final class StreamDelegate: NSObject, URLSessionDataDelegate {
            private let id: String
            private weak var webView: WKWebView?
            private let onFinish: (String) -> Void
            private var buffer = ""

            init(id: String, webView: WKWebView?, onFinish: @escaping (String) -> Void) {
                self.id = id
                self.webView = webView
                self.onFinish = onFinish
            }

            func urlSession(_ session: URLSession, dataTask: URLSessionDataTask, didReceive data: Data) {
                guard let chunk = String(data: data, encoding: .utf8) else { return }
                buffer += chunk
                let parts = buffer.components(separatedBy: "\n")
                buffer = parts.last ?? ""
                for rawLine in parts.dropLast() {
                    let line = rawLine.trimmingCharacters(in: .whitespacesAndNewlines)
                    guard line.hasPrefix("data:") else { continue }
                    let payload = line.dropFirst(5).trimmingCharacters(in: .whitespacesAndNewlines)
                    if payload == "[DONE]" {
                        dispatch(["id": id, "done": true])
                        onFinish(id)
                        return
                    }
                    guard let data = payload.data(using: .utf8),
                          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                          let choices = json["choices"] as? [[String: Any]],
                          let delta = choices.first?["delta"] as? [String: Any],
                          let content = delta["content"] as? String,
                          !content.isEmpty else {
                        continue
                    }
                    dispatch(["id": id, "delta": content])
                }
            }

            func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
                if let error {
                    dispatch(["id": id, "error": error.localizedDescription])
                } else {
                    dispatch(["id": id, "done": true])
                }
                onFinish(id)
            }

            private func dispatch(_ detail: [String: Any]) {
                guard let encoded = try? JSONSerialization.data(withJSONObject: detail),
                      let jsonString = String(data: encoded, encoding: .utf8) else {
                    return
                }
                DispatchQueue.main.async { [weak self] in
                    self?.webView?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('deepseek-stream', { detail: \(jsonString) }));")
                }
            }
        }
    }
}

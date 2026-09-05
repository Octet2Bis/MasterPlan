//
//  TCA_Feature_Template.swift
//  Master Plan — Architecture & Core Templates (03_Developpement_App_and_Design)
//  Inspiration : Point-Free The Composable Architecture (TCA)
//  Plafond strict : < 120 lignes
//

import SwiftUI
import Combine

// MARK: - 1. State (Source Unique de Vérité)
public struct FeatureState: Equatable {
    public var title: String
    public var counter: Int
    public var isLoading: Bool
    public var errorMessage: String?

    public init(
        title: String = "Feature",
        counter: Int = 0,
        isLoading: Bool = false,
        errorMessage: String? = nil
    ) {
        self.title = title
        self.counter = counter
        self.isLoading = isLoading
        self.errorMessage = errorMessage
    }
}

// MARK: - 2. Action (Événements Explicites)
public enum FeatureAction: Equatable {
    case onAppear
    case incrementButtonTapped
    case decrementButtonTapped
    case performAsyncOperation
    case asyncOperationSucceeded(Int)
    case asyncOperationFailed(String)
    case dismissError
}

// MARK: - 3. Reducer (Fonction Pure de Transition d'État)
public struct FeatureReducer {
    public init() {}

    public func reduce(state: inout FeatureState, action: FeatureAction) -> AnyPublisher<FeatureAction, Never>? {
        switch action {
        case .onAppear:
            return nil

        case .incrementButtonTapped:
            state.counter += 1
            return nil

        case .decrementButtonTapped:
            state.counter = max(0, state.counter - 1)
            return nil

        case .performAsyncOperation:
            state.isLoading = true
            state.errorMessage = nil
            return Just(FeatureAction.asyncOperationSucceeded(state.counter * 2))
                .delay(for: .milliseconds(300), scheduler: DispatchQueue.main)
                .eraseToAnyPublisher()

        case let .asyncOperationSucceeded(result):
            state.isLoading = false
            state.counter = result
            return nil

        case let .asyncOperationFailed(msg):
            state.isLoading = false
            state.errorMessage = msg
            return nil

        case .dismissError:
            state.errorMessage = nil
            return nil
        }
    }
}

// MARK: - 4. Store Container (Observable SwiftUI)
@MainActor
public final class FeatureStore: ObservableObject {
    @Published public private(set) var state: FeatureState
    private let reducer: FeatureReducer
    private var cancellables = Set<AnyCancellable>()

    public init(initialState: FeatureState = FeatureState(), reducer: FeatureReducer = FeatureReducer()) {
        self.state = initialState
        self.reducer = reducer
    }

    public func send(_ action: FeatureAction) {
        if let effect = reducer.reduce(state: &state, action: action) {
            effect
                .receive(on: DispatchQueue.main)
                .sink { [weak self] nextAction in
                    self?.send(nextAction)
                }
                .store(in: &cancellables)
        }
    }
}

# Requirements Document

## Introduction

DeClear is an accessibility-first assistant designed primarily for older adults. It takes digital communications such as appointments, bills, service notices, and family messages and converts them into understandable, actionable guidance. This document defines the requirements for the DeClear MVP: a browser-based React application that lets a user select a sample message or paste their own text, configure explanation complexity and preferred language, process the message, and view a clear explanation with required actions, important dates, and urgency. The user can listen to the explanation, inspect the original message, and optionally save an action locally.

The MVP runs entirely in the browser. User messages are never transmitted to cloud services. Processing is performed first by a deterministic demo provider, with a later local Ollama AI provider using the same interface. Safety is central: DeClear never invents dates, deadlines, required actions, or certainty; it shows uncertainty where appropriate; and it never automatically sends messages or creates external calendar events.

Project-wide accessibility and development principles are defined in `.kiro/steering/accessibility.md` and `.kiro/steering/development-rules.md` and apply to this feature in full. They are not duplicated here.

## Glossary

- **DeClear**: The overall accessibility-first assistant application described by this document.
- **DeClear_App**: The React browser application that renders the user interface and coordinates user interactions.
- **Message_Processor**: The `notificationProcessor` service that accepts an input message with configuration and returns a Processing_Result.
- **Processing_Provider**: A component implementing the Message_Processor interface. Two implementations exist: the Demo_Provider and the Ollama_Provider.
- **Demo_Provider**: A deterministic Processing_Provider that returns a fixed Processing_Result for a given input and configuration, without using external services or AI inference.
- **Ollama_Provider**: A Processing_Provider that uses a locally running Ollama AI instance, added after the Demo_Provider, implementing the same Message_Processor interface.
- **Processing_Result**: A structured object returned by the Message_Processor containing the explanation, required actions, important dates, urgency level, and uncertainty indicators.
- **Original_Message**: The unmodified text that the user selected as a sample or pasted.
- **Sample_Message**: A predefined example message provided with the application for the user to select.
- **Explanation_Complexity**: A user-configurable setting controlling the detail level of the generated explanation.
- **Preferred_Language**: A user-configurable setting selecting the output language. Supported values for the MVP are English, Mandarin, French, and Spanish.
- **Required_Action**: A single actionable step derived strictly from the Original_Message content.
- **Important_Date**: A date or deadline derived strictly from the Original_Message content.
- **Urgency_Level**: A categorical indicator of how time-sensitive the Original_Message is. The finite set of Urgency_Level categories is defined here as exactly: None, Low, Medium, and High.
- **Uncertainty_Indicator**: A marker in the Processing_Result signaling that a piece of information is unclear or not explicitly stated in the Original_Message.
- **Settings_Store**: The browser localStorage mechanism used to persist Preferred_Language and Explanation_Complexity.
- **Task_Store**: The browser localStorage mechanism used to persist optionally saved Required_Actions.
- **Saved_Action**: A Required_Action the user has chosen to persist locally in the Task_Store.
- **Read_Aloud**: The feature that uses the browser speechSynthesis API to speak the explanation aloud.

## Requirements

### Requirement 1: Message Input Selection

**User Story:** As an older adult, I want to select a provided example or paste my own message, so that I can get help understanding communications I receive.

#### Acceptance Criteria

1. THE DeClear_App SHALL display a list of between 1 and 10 selectable Sample_Messages.
2. WHEN the user selects a Sample_Message, THE DeClear_App SHALL set the Original_Message to the selected Sample_Message text and SHALL visually indicate which Sample_Message is currently selected.
3. THE DeClear_App SHALL provide a text input area that accepts up to 5000 characters where the user can paste or type an Original_Message.
4. WHEN the user enters text into the text input area, THE DeClear_App SHALL set the Original_Message to the entered text, trimmed of leading and trailing whitespace.
5. IF the user enters text into the text input area while a Sample_Message is selected, THEN THE DeClear_App SHALL clear the Sample_Message selection indication.
6. IF the user requests processing while the Original_Message contains zero characters after trimming leading and trailing whitespace, THEN THE DeClear_App SHALL display a message prompting the user to provide input and SHALL NOT invoke the Message_Processor.
7. IF the user requests processing while the Original_Message exceeds 5000 characters, THEN THE DeClear_App SHALL display a message indicating the input exceeds the maximum length and SHALL NOT invoke the Message_Processor.

### Requirement 2: Explanation Complexity Configuration

**User Story:** As an older adult, I want to choose how detailed the explanation is, so that I receive guidance at a level that matches my comfort.

#### Acceptance Criteria

1. THE DeClear_App SHALL provide a control that presents the defined set of selectable Explanation_Complexity levels and allows exactly one level to be selected at a time.
2. WHEN the user selects an Explanation_Complexity value, THE DeClear_App SHALL persist the selected value to the Settings_Store.
3. IF persisting the selected Explanation_Complexity value to the Settings_Store fails, THEN THE DeClear_App SHALL retain the selected value for the current session and display an indication that the preference could not be saved.
4. WHEN the DeClear_App starts and a persisted Explanation_Complexity value exists in the Settings_Store, THE DeClear_App SHALL apply the persisted value.
5. IF the DeClear_App starts and the persisted Explanation_Complexity value is not one of the defined selectable levels, THEN THE DeClear_App SHALL apply the default Explanation_Complexity value.
6. WHEN the DeClear_App starts and no persisted Explanation_Complexity value exists in the Settings_Store, THE DeClear_App SHALL apply the default Explanation_Complexity value, where the default is one of the defined selectable levels.
7. WHEN the user requests processing, THE DeClear_App SHALL pass the current Explanation_Complexity value to the Message_Processor.

### Requirement 3: Preferred Language Configuration

**User Story:** As an older adult, I want to choose the language of the explanation, so that I can understand the guidance in my preferred language.

#### Acceptance Criteria

1. THE DeClear_App SHALL provide a control for selecting the Preferred_Language from exactly the four values English, Mandarin, French, and Spanish.
2. WHEN the user selects a Preferred_Language value, THE DeClear_App SHALL persist the selected value to the Settings_Store and apply it to the current session without requiring a restart.
3. IF persisting the selected Preferred_Language value to the Settings_Store fails, THEN THE DeClear_App SHALL retain the previously applied Preferred_Language for the current session and display an error message indicating that the language preference could not be saved.
4. WHEN the DeClear_App starts and a persisted Preferred_Language value matching one of the four supported values exists in the Settings_Store, THE DeClear_App SHALL apply the persisted value.
5. IF the DeClear_App starts and the persisted Preferred_Language value is absent, empty, or not one of the four supported values, THEN THE DeClear_App SHALL apply English as the default Preferred_Language.
6. WHEN the user requests processing, THE DeClear_App SHALL pass the current Preferred_Language value to the Message_Processor.
7. WHEN the Message_Processor returns a Processing_Result, THE DeClear_App SHALL display the explanation text in the Preferred_Language that was passed with the request.

### Requirement 4: Message Processing

**User Story:** As an older adult, I want DeClear to process my message, so that I receive clear and actionable guidance.

#### Acceptance Criteria

1. WHEN the user requests processing and the Original_Message contains between 1 and 10000 characters, THE DeClear_App SHALL invoke the Message_Processor with the Original_Message, the Explanation_Complexity, and the Preferred_Language.
2. IF the user requests processing while the Original_Message is empty or exceeds 10000 characters, THEN THE DeClear_App SHALL NOT invoke the Message_Processor and SHALL display a message describing the input problem.
3. WHILE the Message_Processor is processing a message, THE DeClear_App SHALL display a processing-in-progress indicator.
4. IF the Message_Processor does not return a Processing_Result within 30 seconds, THEN THE DeClear_App SHALL stop displaying the processing-in-progress indicator, display an error indication, and retain the Original_Message for the user to retry.
5. WHEN the Message_Processor returns a Processing_Result, THE DeClear_App SHALL display the explanation, the Required_Actions, the Important_Dates, and the Urgency_Level from the Processing_Result.
6. WHEN the Message_Processor returns a Processing_Result in which the Required_Actions collection or the Important_Dates collection is empty, THE DeClear_App SHALL display an indication that no required actions or no important dates, respectively, were found.
7. IF the Message_Processor fails to produce a Processing_Result, THEN THE DeClear_App SHALL display an error message and SHALL retain the Original_Message for the user to retry.

### Requirement 5: Structured Processing Result

**User Story:** As a developer, I want the Message_Processor to return a consistent structured result, so that the user interface and multiple providers share one data contract.

#### Acceptance Criteria

1. WHEN the Message_Processor returns a Processing_Result, THE Message_Processor SHALL include all of the following fields present in every result: an explanation field, a Required_Actions field, an Important_Dates field, an Urgency_Level field, and an Uncertainty_Indicators field.
2. THE Message_Processor SHALL represent the Required_Actions field as an ordered collection of zero or more Required_Action items, preserving the order in which the actions are identified.
3. WHEN no Required_Action is identified in the Original_Message, THE Message_Processor SHALL set the Required_Actions field to an empty ordered collection.
4. THE Message_Processor SHALL represent the Important_Dates field as a collection of zero or more Important_Date items, and SHALL set this field to an empty collection when no Important_Date is identified.
5. THE Message_Processor SHALL set the Urgency_Level field to exactly one value selected from the defined finite set of Urgency_Level categories specified in the Glossary.
6. IF a piece of information in the Processing_Result is not explicitly stated in the Original_Message, THEN THE Message_Processor SHALL attach an Uncertainty_Indicator to that piece of information in the Uncertainty_Indicators field.
7. THE Demo_Provider SHALL return a Processing_Result containing the identical set of fields defined in acceptance criterion 1.
8. THE Ollama_Provider SHALL return a Processing_Result containing the identical set of fields defined in acceptance criterion 1.

### Requirement 6: Processing Provider Abstraction

**User Story:** As a developer, I want a single processing interface with swappable providers, so that the deterministic demo mode and a later local AI mode use the same contract.

#### Acceptance Criteria

1. THE Message_Processor SHALL define a single interface that accepts an Original_Message, an Explanation_Complexity, and a Preferred_Language, and returns a Processing_Result whose explanation content corresponds to the requested Explanation_Complexity and Preferred_Language.
2. IF the Original_Message provided to the Message_Processor interface is empty or exceeds 10000 characters, THEN THE configured Processing_Provider SHALL NOT produce a Processing_Result and SHALL report an input-validation error.
3. THE Demo_Provider SHALL implement the Message_Processor interface.
4. WHEN the Demo_Provider processes the same Original_Message with the same Explanation_Complexity and the same Preferred_Language, THE Demo_Provider SHALL return an identical Processing_Result on each invocation.
5. THE Ollama_Provider SHALL implement the Message_Processor interface using a locally running Ollama instance.
6. IF the Ollama_Provider cannot reach the local Ollama instance or does not receive a response within 30 seconds, THEN THE Ollama_Provider SHALL report an error and SHALL NOT return a partial Processing_Result.
7. WHERE the DeClear_App is configured to use a specific Processing_Provider, THE DeClear_App SHALL route processing requests to the configured Processing_Provider.
8. IF no valid Processing_Provider is configured when the user requests processing, THEN THE DeClear_App SHALL display an error indication and SHALL NOT invoke a Processing_Provider.

### Requirement 7: Read Aloud

**User Story:** As an older adult, I want to listen to the explanation, so that I can receive guidance without reading it myself.

#### Acceptance Criteria

1. WHERE the browser supports the speechSynthesis API, THE DeClear_App SHALL display a Read_Aloud control for the explanation.
2. WHEN the user activates the Read_Aloud control, THE DeClear_App SHALL begin speaking the full explanation text using the speechSynthesis API within 1 second.
3. WHILE the explanation is being spoken, THE DeClear_App SHALL display a control to stop the speech.
4. WHEN the user activates the stop control during speech, THE DeClear_App SHALL stop the speech within 1 second and stop displaying the stop control.
5. WHEN the speechSynthesis API finishes speaking the explanation, THE DeClear_App SHALL stop displaying the stop control.
6. IF the speechSynthesis API reports an error while starting or during speech, THEN THE DeClear_App SHALL stop the speech, stop displaying the stop control, and display an indication that read-aloud is unavailable.
7. IF the browser does not support the speechSynthesis API, THEN THE DeClear_App SHALL omit the Read_Aloud control.

### Requirement 8: Inspect Original Message

**User Story:** As an older adult, I want to see the original message, so that I can verify the guidance against the source.

#### Acceptance Criteria

1. THE DeClear_App SHALL provide a control to inspect the Original_Message.
2. WHEN the user activates the inspect control, THE DeClear_App SHALL display the full Original_Message text within 1 second, byte-for-byte identical to the text that was provided, including all whitespace, line breaks, punctuation, and capitalization.
3. THE DeClear_App SHALL retain the Original_Message content unchanged, with no characters added, removed, reordered, or altered, from the moment it is provided through all processing and display operations.
4. WHILE the inspect view is open, THE DeClear_App SHALL provide a control to close the inspect view and return to the previous view.
5. IF the Original_Message is empty or unavailable when the user activates the inspect control, THEN THE DeClear_App SHALL display a message indicating that no original message is available.

### Requirement 9: Save Action Locally

**User Story:** As an older adult, I want to save an action to my device, so that I can refer back to it later.

#### Acceptance Criteria

1. THE DeClear_App SHALL provide a control to save a Required_Action as a Saved_Action.
2. WHEN the user activates the save control for a Required_Action, THE DeClear_App SHALL persist the corresponding Saved_Action to the Task_Store and display an indication that the save succeeded.
3. IF the user activates the save control for a Required_Action that is already present as a Saved_Action in the Task_Store, THEN THE DeClear_App SHALL retain a single Saved_Action for that Required_Action without creating a duplicate entry.
4. IF persisting a Saved_Action to the Task_Store fails, THEN THE DeClear_App SHALL retain the user's current view, leave previously persisted Saved_Actions unchanged, and display an indication that the save did not succeed.
5. WHEN the DeClear_App starts and one or more Saved_Actions exist in the Task_Store, THE DeClear_App SHALL display all persisted Saved_Actions.
6. IF the Task_Store cannot be read at startup, THEN THE DeClear_App SHALL start with no Saved_Actions displayed and display an indication that saved actions could not be loaded.
7. THE DeClear_App SHALL provide a control to remove a Saved_Action.
8. WHEN the user activates the remove control for a Saved_Action, THE DeClear_App SHALL delete that Saved_Action from the Task_Store and stop displaying it.

### Requirement 10: Safety and Fidelity Constraints

**User Story:** As an older adult, I want DeClear to be honest and not invent information, so that I can trust the guidance and stay in control.

#### Acceptance Criteria

1. THE Message_Processor SHALL derive every Important_Date in the Processing_Result from explicit content in the Original_Message.
2. IF a candidate Important_Date cannot be traced to explicit content in the Original_Message, THEN THE Message_Processor SHALL exclude that Important_Date from the Processing_Result.
3. THE Message_Processor SHALL derive every Required_Action in the Processing_Result from explicit content in the Original_Message.
4. IF a candidate Required_Action cannot be traced to explicit content in the Original_Message, THEN THE Message_Processor SHALL exclude that Required_Action from the Processing_Result.
5. WHERE the Original_Message does not state a date, a deadline, or a required action explicitly, THE Message_Processor SHALL attach an Uncertainty_Indicator to the corresponding Processing_Result element rather than present the information as certain.
6. WHEN the DeClear_App displays a Processing_Result element that carries an Uncertainty_Indicator, THE DeClear_App SHALL present a textual uncertainty label on that element, and SHALL NOT rely on colour as the only means of conveying uncertainty.
7. THE DeClear_App SHALL process the Original_Message within the browser and SHALL NOT transmit the Original_Message to any cloud service or external network endpoint.
8. THE DeClear_App SHALL preserve the Original_Message unchanged and SHALL make the Original_Message available for the user to view alongside the Processing_Result.
9. THE DeClear_App SHALL present Required_Actions as guidance for the user to perform and SHALL NOT perform any Required_Action automatically.
10. WHEN the user issues an explicit save command for a Required_Action, THE DeClear_App SHALL persist the corresponding Saved_Action, and SHALL NOT persist any Saved_Action in the absence of that explicit user command.

### Requirement 11: Out-of-Scope Boundaries

**User Story:** As a user, I want DeClear to avoid taking actions on my behalf and to avoid unsupported capabilities, so that I remain in control and the product scope is clear.

#### Acceptance Criteria

1. THE DeClear_App SHALL operate without user accounts and without authentication, such that no login, registration, or credential-entry interface is presented at any point of use.
2. THE DeClear_App SHALL store all user data only in the browser Settings_Store and Task_Store and SHALL NOT transmit user data to any external or cloud database.
3. THE DeClear_App SHALL be delivered as a browser application and SHALL NOT be delivered as a native mobile application.
4. THE DeClear_App SHALL operate without intercepting, reading, or modifying operating-system notifications.
5. WHEN the user explicitly confirms creation of an external calendar event, THE DeClear_App SHALL create exactly one external calendar event for that confirmation.
6. THE DeClear_App SHALL NOT create any external calendar event in the absence of an explicit user confirmation action.
7. WHEN the user explicitly confirms sending of a message, THE DeClear_App SHALL send exactly one message for that confirmation.
8. THE DeClear_App SHALL NOT send any message in the absence of an explicit user confirmation action.
9. WHEN the user explicitly confirms a payment, THE DeClear_App SHALL initiate exactly one payment for that confirmation.
10. THE DeClear_App SHALL NOT initiate or perform any payment in the absence of an explicit user confirmation action.

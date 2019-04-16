// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { AttachmentLayoutTypes, ActivityTypes, CardFactory } = require('botbuilder');
const { ChoicePrompt, DialogSet, DialogTurnStatus, ListStyle } = require('botbuilder-dialogs');

/**
 * RichCardsBot prompts a user to select a Rich Card and then returns the card
 * that matches the user's selection.
 */
class RichCardsBot {
    /**
     * Constructs the three pieces necessary for this bot to operate:
     * 1. StatePropertyAccessor
     * 2. DialogSet
     * 3. ChoicePrompt
     *
     * The only argument taken (and required!) by this constructor is a
     * ConversationState instance.
     * The ConversationState is used to create a BotStatePropertyAccessor
     * which is needed to create a DialogSet that houses the ChoicePrompt.
     * @param {ConversationState} conversationState The state that will contain the DialogState BotStatePropertyAccessor.
     */
    constructor(conversationState) {
        // Store the conversationState to be able to save state changes.
        this.conversationState = conversationState;
        // Create a DialogState StatePropertyAccessor which is used to
        // persist state using dialogs.
        this.dialogState = conversationState.createProperty('dialogState');

        // Create a DialogSet that contains the ChoicePrompt.
        this.dialogs = new DialogSet(this.dialogState);

        // Create the ChoicePrompt with a unique id of 'cardPrompt' which is
        // used to call the dialog in the bot's onTurn logic.
        const prompt = new ChoicePrompt('cardPrompt');

        // Set the choice rendering to list and then add it to the bot's DialogSet.
        prompt.style = ListStyle.list;
        this.dialogs.add(prompt);
    }

    /**
     * Driver code that does one of the following:
     * 1. Prompts the user if the user is not in the middle of a dialog.
     * 2. Re-prompts a user when an invalid input is received.
     * 3. Sends back to the user a Rich Card response after a valid prompt reply.
     *
     * These three scenarios are preceded by an Activity type check.
     * This check ensures that the bot only responds to Activities that
     * are of the "Message" type.
     *
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     */
    async onTurn(turnContext) {
        if (turnContext.activity.type === ActivityTypes.Message) {
            // Construct a DialogContext instance which is used to resume any
            // existing Dialogs and prompt users.
            const dc = await this.dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (!turnContext.responded && results.status === DialogTurnStatus.empty) {
                /*await turnContext.sendActivity('Bienvenido al bot Catastr!');
                // Create the PromptOptions which contain the prompt and re-prompt messages.
                // PromptOptions also contains the list of choices available to the user.
                const promptOptions = {
                    prompt: 'Please select a card:',
                    retryPrompt: 'That was not a valid choice, please select a card or number from 1 to 8.',
                    choices: this.getChoices()
                };

                // Prompt the user with the configured PromptOptions.
                await dc.prompt('cardPrompt', promptOptions);

            // The bot parsed a valid response from user's prompt response and so it must respond. */
                await turnContext.sendActivity({ attachments: [this.createVideoCard()] });
            } else if (results.status === DialogTurnStatus.complete) {
                await this.sendCardResponse(turnContext, results);
            }
            await this.conversationState.saveChanges(turnContext);
        }
    }

    /**
     * Send a Rich Card response to the user based on their choice.
     *
     * This method is only called when a valid prompt response is parsed from the user's response to the ChoicePrompt.
     * @param {TurnContext} turnContext A TurnContext instance containing all the data needed for processing this conversation turn.
     * @param {DialogTurnResult} dialogTurnResult Contains the result from any called Dialogs and indicates the status of the DialogStack.
     */
    async sendCardResponse(turnContext, dialogTurnResult) {
        switch (dialogTurnResult.result.value) {

        case 'Video Card':
            await turnContext.sendActivity({ attachments: [this.createVideoCard()] });
            break;
        case 'All Cards':
            await turnContext.sendActivity({
                attachments: [this.createVideoCard(),
                    this.createAnimationCard(),
                    this.createAudioCard(),
                    this.createHeroCard(),
                    this.createReceiptCard(),
                    this.createSignInCard(),
                    this.createThumbnailCard(),
                    this.createVideoCard()
                ],
                attachmentLayout: AttachmentLayoutTypes.Carousel
            });
            break;
        default:
            await turnContext.sendActivity('An invalid selection was parsed. No corresponding Rich Cards were found.');
        }
    }

    /**
     * Create the choices with synonyms to render for the user during the ChoicePrompt.
     */
    getChoices() {
        const cardOptions = [
           
            {
                value: 'Video Card',
                synonyms: ['7', 'video', 'hola']
            }
        ];

        return cardOptions;
    }

    // ======================================
    // Helper functions used to create cards.
    // ======================================

    createVideoCard() {
        return CardFactory.videoCard(
            'Bienvenido al Tribunal',
            [{ url: 'https://www.youtube.com/watch?v=7mYgtd2rifY' }],
       
         
        );
    }
}

module.exports.RichCardsBot = RichCardsBot;
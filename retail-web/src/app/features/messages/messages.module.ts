import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { SharedModule } from '../../shared/shared.module';
import { MessagesRoutingModule } from './messages-routing.module';
import { MessagesEffects } from './store/messages.effects';
import { messagesFeatureKey, messagesReducer } from './store/messages.reducer';
import { ThreadListComponent } from './components/thread-list/thread-list.component';
import { ThreadViewComponent } from './components/thread-view/thread-view.component';
import { ComposeMessageComponent } from './components/compose-message/compose-message.component';
import { MessageBubbleComponent } from './components/message-bubble/message-bubble.component';

/** Secure messaging with the contact centre. Behind flag mol.secure-messages.enabled. */
@NgModule({
  declarations: [
    ThreadListComponent,
    ThreadViewComponent,
    ComposeMessageComponent,
    MessageBubbleComponent
  ],
  imports: [
    SharedModule,
    MessagesRoutingModule,
    StoreModule.forFeature(messagesFeatureKey, messagesReducer),
    EffectsModule.forFeature([MessagesEffects])
  ]
})
export class MessagesModule {}

import type { GameChatContent } from '../types'
import { Field } from './Field'

export function GameChatMockup({ content }: { content: GameChatContent }) {
  return (
    <div className="game">
      <div className="game-header">
        <span className="game-logo">⛏️ {content.game}</span>
        <span className="game-channel">{content.channel}</span>
      </div>
      <div className="game-chat">
        <p>
          <span className="game-name game-name-friend">{content.friend}:</span> {content.friendMessage}
        </p>
        <p>
          <Field name="player" text={content.player} className="game-name game-name-stranger" />:{' '}
          <Field name="message" text={content.message} />{' '}
          <Field name="link" text={content.link} className="fake-link" />
        </p>
      </div>
      <div className="game-input">Type a message…</div>
    </div>
  )
}

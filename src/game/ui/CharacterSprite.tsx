import { clsx } from 'clsx';
import { ASSETS } from '../data/assets';
import type { Expression, NpcId } from '../types';

const EXPRESSIONS: Expression[] = ['neutral', 'happy', 'confused', 'nervous'];

interface CharacterSpriteProps {
  npc: NpcId;
  emotion: Expression;
  className?: string;
  dimmed?: boolean;
}

export function CharacterSprite({ npc, emotion, className, dimmed = false }: CharacterSpriteProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'pointer-events-none absolute bottom-0 left-1/2 h-[94%] -translate-x-1/2 transition-[filter] duration-500',
        dimmed && 'brightness-[0.82]',
        className,
      )}
    >
      {EXPRESSIONS.map((item) => (
        <img
          key={item}
          src={ASSETS.characters[npc][item]}
          alt=""
          draggable={false}
          className={clsx(
            'absolute bottom-0 left-1/2 h-full max-w-none -translate-x-1/2 select-none object-contain object-bottom transition-opacity duration-300 ease-out',
            item === emotion ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}
    </div>
  );
}

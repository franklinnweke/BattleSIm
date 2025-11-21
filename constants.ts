import { Character } from './types';

// We use specific prompts to ensure the images look cool and accurate.
export const CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: 'Son Goku',
    anime: 'Dragon Ball Z',
    description: 'A Saiyan warrior raised on Earth who constantly strives to break his limits.',
    stats: { power: 98, speed: 95, intelligence: 70, stamina: 99 },
  },
  {
    id: 'c2',
    name: 'Saitama',
    anime: 'One Punch Man',
    description: 'A hero who can defeat any opponent with a single punch.',
    stats: { power: 100, speed: 99, intelligence: 50, stamina: 100 },
  },
  {
    id: 'c3',
    name: 'Naruto Uzumaki',
    anime: 'Naruto',
    description: 'The Seventh Hokage of the Hidden Leaf Village.',
    stats: { power: 88, speed: 90, intelligence: 85, stamina: 95 },
  },
  {
    id: 'c4',
    name: 'Monkey D. Luffy',
    anime: 'One Piece',
    description: 'Captain of the Straw Hat Pirates aiming to be the Pirate King.',
    stats: { power: 92, speed: 88, intelligence: 60, stamina: 98 },
  },
  {
    id: 'c5',
    name: 'Satoru Gojo',
    anime: 'Jujutsu Kaisen',
    description: 'The strongest Jujutsu Sorcerer, wielding the Limitless and Six Eyes.',
    stats: { power: 97, speed: 96, intelligence: 95, stamina: 90 },
  },
  {
    id: 'c6',
    name: 'Eren Yeager',
    anime: 'Attack on Titan',
    description: 'Holder of the Founding Titan, driven by a desire for freedom.',
    stats: { power: 90, speed: 75, intelligence: 80, stamina: 85 },
  },
  {
    id: 'c7',
    name: 'Ichigo Kurosaki',
    anime: 'Bleach',
    description: 'A Substitute Soul Reaper with immense spiritual pressure.',
    stats: { power: 91, speed: 94, intelligence: 75, stamina: 92 },
  },
  {
    id: 'c8',
    name: 'Light Yagami',
    anime: 'Death Note',
    description: 'A genius student who possesses the Death Note.',
    stats: { power: 10, speed: 30, intelligence: 100, stamina: 40 },
  }
];
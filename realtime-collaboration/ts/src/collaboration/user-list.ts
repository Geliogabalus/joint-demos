import type { User } from './user';

interface AwarenessState {
    user?: { name: string; color: string };
    cursor?: { x: number; y: number };
    selection?: string[];
}

let remoteEl: HTMLElement;

export function init(localUser: User, onNameChange: (name: string) => void): void {
    const usersEl = document.querySelector('#users')!;

    const localEl = document.createElement('div');
    localEl.innerHTML = `<div class="user user-local" style='color:${localUser.color};'><span class="user-bullet">•</span><span class="user-name" contenteditable="true" spellcheck="false">${localUser.name}</span><span class="user-you">you</span></div>`;

    remoteEl = document.createElement('div');

    usersEl.appendChild(localEl);
    usersEl.appendChild(remoteEl);

    const nameEl = localEl.querySelector('.user-name') as HTMLElement;

    nameEl.addEventListener('blur', () => {
        const newName = nameEl.textContent?.trim() || localUser.name;
        nameEl.textContent = newName;
        if (newName !== localUser.name) {
            onNameChange(newName);
        }
    });

    nameEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            nameEl.blur();
        }
    });

    document.addEventListener('pointerdown', (e) => {
        if (document.activeElement === nameEl && e.target !== nameEl) {
            nameEl.blur();
        }
    });
}

export function render(states: Map<number, AwarenessState>, localUser: User): void {
    if (!remoteEl) return;

    const remoteStrings: string[] = [];

    states.forEach((state) => {
        if (!state.user || state.user.name === localUser.name) return;
        remoteStrings.push(`<div class="user" style='color:${state.user.color};'><span class="user-bullet">•</span><span class="user-name">${state.user.name}</span></div>`);
    });

    remoteEl.innerHTML = remoteStrings.join('');
}

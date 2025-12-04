import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export function input(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer: string) => {
            resolve(answer);
        });
    });
}

export function close(): void {
    rl.close();
}

// Exportamos solo utilidades, NO el main
module.exports = {
    input,
    close
};
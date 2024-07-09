import crypto from 'crypto';

// Función para generar un salt

const salt = 'hashearPassFacil135';

// Función para hash de una contraseña con un salt
export function hashPassword(password: string): string {
    const hash = crypto.createHmac('sha256', salt + `${password.length}`);
    hash.update(password);
    return hash.digest('hex');
}

// Función para verificar la contraseña
export function verifyPassword(password: string, hashedPassword: string): boolean {
    const hash = hashPassword(password);
    return hash === hashedPassword;
}

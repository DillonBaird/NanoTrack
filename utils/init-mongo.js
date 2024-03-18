db = db.getSiblingDB('nanotrack');

db.createUser({
    user: 'nanotrack',
    pwd: 'nanotrack',
    roles: [
        {
            role: 'readWrite',
            db: 'nanotrack',
        },
    ],
});

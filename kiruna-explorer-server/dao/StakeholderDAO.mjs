import db from "../db.mjs";

export default function StakeholderDAO() {

    this.getStakeholders = async () => {
        const query = `SELECT * FROM stakeholder`;
        return new Promise((resolve, reject) => {
            db.all(query, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            }
            )
        })
    };

    this.getStakeHolderById = async (id) => {
        const query = `SELECT * FROM stakeholder WHERE id = ?`;
        return new Promise((resolve, reject) => {
            db.get(query, [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            }
            )
        })
    };

    this.getStakeholderByName = async (name) => {
        const query = `SELECT * FROM stakeholder WHERE name = ? COLLATE NOCASE`;
        return new Promise((resolve, reject) => {
            db.get(query, [name], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            }
            )
        })
    };

    this.addStakeholder = async (name) => {
        const query = `INSERT INTO stakeholder (name) VALUES (?)`;
        return new Promise((resolve, reject) => {
            db.run(query, [name], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            });

        })
    };

    this.getDocumentStakeholders = async (docId) => {
        const query = `SELECT * FROM stakeholder WHERE id IN (SELECT stakeholderId FROM document_stakeholder WHERE docId = ?)`;
        return new Promise((resolve, reject) => {
            db.all(query, [docId], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            }
            )
        })
    };

    this.addDocumentStakeholder = async (stakeholderId, docId) => {
        const query = `INSERT INTO document_stakeholder (documentId, stakeholderId) VALUES (?, ?)`;
        return new Promise((resolve, reject) => {
            db.run(query, [docId, stakeholderId], function (err) {
                if (err) {
                    return reject(err);
                }
                resolve(this.lastID);
            }
            )
        })
    };


}
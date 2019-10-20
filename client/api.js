
export function apiUpdateFromRevision(revision) {

    return Promise.resolve((() => {

        if (revision === 0) {
            return {
                revision: 1,

                tasks: [
                    { id: "TA", name: "Big A", parent: "root" },
                    { id: "TB", name: "Big B", parent: "root" },
                    { id: "TC", name: "Big C", parent: "root" },

                    { id: "TA1", name: "Step 1", parent: "TA" },
                    { id: "TA2", name: "Step 2", parent: "TA" },
                    { id: "TA3", name: "Step 3", parent: "TA" },

                    { id: "TB1", name: "Step 1", parent: "TB" },
                    { id: "TB2", name: "Step 2", parent: "TB" },
                    { id: "TB3", name: "Step 3", parent: "TB" },

                    { id: "TC1", name: "Step 1", parent: "TC" },
                    { id: "TC2", name: "Step 2", parent: "TC" },
                    { id: "TC3", name: "Step 3", parent: "TC" },

                    { id: "TC1.1", name: "Sub-step 1", parent: "TC1" },
                    { id: "TC1.2", name: "Sub-step 2", parent: "TC1" },
                    { id: "TC1.3", name: "Sub-step 3", parent: "TC1" },
                ],
            }
        } else {
            return { revision: 1, tasks: [] }
        }

    })())
}

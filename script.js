const generateButton = document.querySelector('.letter-preview button');
generateButton.addEventListener('click', async function(){
    const clientName = document.querySelector('.search-wrapper input').value.trim();
    const dateValue = document.querySelector('.filter-group input').value;
    const subjectValue = document.querySelector('.letter-subject input').value;
    const addressValue = document.querySelector('.letter-address textarea').value;

    const [year, month, day]= dateValue.split('-');

    const partialReference = `ACA/${month}/${year}`;

    let clientNameArray = clientName.split(' ');
    let clientInitials = '';
    for (let i = 0 ; i < clientNameArray.length; i++){
        clientInitials += clientNameArray[i][0].toUpperCase();
    }
    
    let isUnique = await checkInitials(clientInitials);

    if (!isUnique){
        console.log(`Initials ${clientInitials} are taken. Adding ... `);

        const lastName = clientNameArray[clientNameArray.length - 1 ];

        if (lastName && lastName.length > 1) {
            clientInitials += lastName[1].toUpperCase();
        } else {
            clientInitials += '2';
        }
    }

    const isInserted = await insertData(partialReference, clientInitials, subjectValue, addressValue);
    alert(isInserted);
    const clientID = await getID(clientInitials);
    consolelog(clientID);
})

async function checkInitials(initials){
    const response = await fetch(`https://referencenumber.onrender.com/checkInitials?initials=${initials}`);
    const data = await response.json();
    return data.unique;
}

function getID(initials){
    const response = await fetch(`https://referencenumber.onrender.com/getId?initials=${initials}`);
    const data = await response.json();
    return data;
}

async function insertData(reference, initials, subject, address){
    const payload = {reference, initials, subject, address};

    const response = await fetch('https://referencenumber.onrender.com/insert',{
        method:'POST',
        headers:{'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
    });
    const data =  await response.json();

    return data.message;
}
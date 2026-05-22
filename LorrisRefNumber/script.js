const generateButton = document.querySelector('.letter-preview button');
generateButton.addEventListener('click', function(){
    const clientName = document.querySelector('.search-wrapper input').value.trim();
    const dateValue = document.querySelector('.filter-group input').value;
    const subjectValue = document.querySelector('.letter-subject input').value;
    const addressValue = document.querySelector('.letter-address textarea').value;
    console.log(subjectValue,addressValue);

    const [year, month, day]= dateValue.split('-');

    
    let clientNameArray = clientName.split(' ');
    let clientInitials = '';
    for (let i = 0 ; i < clientNameArray.length; i++){
        clientInitials += clientNameArray[i][0].toUpperCase();
    }
    console.log(clientInitials);
    /*
    if (checkInitials(clientInitials)){
        let referenceNumber = `ACA/${month}/${year}/${clientInitials}`;
        insertData();
    }
    */
})

async function checkInitials(initials){
    const response = await fetch(`http://localhost:3000/checkInitials?initials=${initials}`);
    const data = await response.json();
    
}

function getID(){

}

function insertData(){

}
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/login';
  }
});

const searchbtn = document.querySelector('.hero-search button');
const searchValue = document.querySelector('.hero-search input');

searchbtn.addEventListener('click', function(){
    const searchName = searchValue.value.trim();
    searchbtn.textContent = 'Loading..'
    searchTable(searchName);
})


async function searchTable(name){
    try{
        const response = await fetch(`https://referencenumber.onrender.com/search?name=${name}`,{
            headers: {
            'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        renderTable(data);
    }catch(err){
        console.error(err);
    }
}

function renderTable(data){
    const grid = document.getElementById('cardsGrid');
    const meta = document.getElementById('resultsMeta');

    meta.textContent = `${data.length} record${data.length !== 1 ? 's' : ''}`; 
    if (!data.length) {
        grid.innerHTML = `<div class="empty-state"><p>No records found.</p></div>`;
        searchbtn.textContent = 'Search';
        return;
    }
    grid.innerHTML = data.map((row, i) => `
        <div class="ref-card" style="animation-delay:${i * 0.03}s" onclick="openDetail('${row.id}')">
            <div class="ref-card-header">
                <span class="ref-id">${row.id}/${row.partial_reference}/${row.initials}</span>
                <div class="ref-header-right">
                    ${row.created_at ? `<span class="ref-date"><i class="fa fa-calendar"></i> ${row.created_at.split('T')[0]}</span>` : ''}
                    <span class="ref-initial">${row.initials || ''}</span>
                </div>
            </div>
            <div class="ref-card-body">
                <div class="ref-row">
                    <span class="ref-label"><i class="fa fa-user"></i>Personel Name</span>
                    <span class="ref-value ref-name">${row.clientname || '—'}</span>
                </div>
                <div class="ref-row">
                    <span class="ref-label"><i class="fa fa-tag"></i> Subject</span>
                    <span class="ref-value">${row.subject || '—'}</span>
                </div>
                <div class="ref-row">
                    <span class="ref-label"><i class="fa fa-map-marker"></i> Address</span>
                    <span class="ref-value ref-address">${(row.receiver_address || '—').replace(/\n/g, '<br>')}</span>
                </div>
            </div>
        </div>
    `).join('');
    searchbtn.textContent = 'Search';
}
const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/login/index.html';
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
        <div class="ref-card" style="animation-delay:${i * 0.03}s" onclick="openDetail(${row.id})">
            <div class="ref-id">${String(row.id)}/${row.partial_reference}/${row.initials}</div>
            <div class="ref-body">
                <div class="ref-name">${row.clientname || '—'}</div>
                <div class="ref-subject">${row.subject || '—'}</div>
                <div class="ref-subject">${row.receiver_address || '-'}</div>
            </div>
            <div class="ref-meta">
                ${row.created_at ? `<span class="ref-date">${row.created_at.split('T')[0]}</span>` : ''}
                <span class="ref-initial">${row.initials || ''}</span>
            </div>
        </div>
    `).join('');
    searchbtn.textContent = 'Search';
}
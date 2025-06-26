const baseURL = 'http://localhost:3000/posts';
let posts = [];
let currentPostId = null;
const $ = id => document.getElementById(id);

function fetchPosts() {
  fetch(baseURL)
    .then(res => res.json())
    .then(data => {
      posts = data;
      renderPosts();
    });
}

function renderPosts() {
  const list = $('post-list');
  list.innerHTML = '';
  posts.forEach(post => {
    const li = document.createElement('li');
    li.textContent = `${post.title} - ${post.author} • ${post.date}`;
    li.onclick = () => showPost(post.id);
    list.appendChild(li);
  });
}

function showPost(id) {
  fetch(`${baseURL}/${id}`)
    .then(res => res.json())
    .then(post => {
      currentPostId = id;
      $('detail-title').textContent = post.title;
      $('detail-meta').textContent = `By ${post.author} - ${post.date}`;
      $('detail-image').src = post.image;
      $('detail-content').textContent = post.content;

      $('edit-title').value = post.title;
      $('edit-content').value = post.content;
    });
}

function deletePost() {
  if (!currentPostId) return;
  fetch(`${baseURL}/${currentPostId}`, { method: 'DELETE' })
    .then(() => {
      currentPostId = null;
      clearDetail();
      fetchPosts();
    });
}

function clearDetail() {
  $('detail-title').textContent = "Select a post";
  $('detail-meta').textContent = "";
  $('detail-image').src = "https://via.placeholder.com/500x200?text=No+Post+Selected";
  $('detail-content').textContent = "Post content will appear here.";
  $('edit-title').value = '';
  $('edit-content').value = '';
}

$('create-form').addEventListener('submit', e => {
  e.preventDefault();
  const title = $('new-title').value.trim();
  const author = $('new-author').value.trim();
  const image = $('new-image').value.trim();
  const content = $('new-content').value.trim();

  if (title && author && content) {
    const newPost = {
      title, author, content,
      date: new Date().toISOString().split('T')[0],
      image: image || "https://via.placeholder.com/500x200?text=New+Post"
    };
    fetch(baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
      .then(res => res.json())
      .then(post => {
        posts.unshift(post);
        renderPosts();
        showPost(post.id);
        e.target.reset();
      });
  }
});

$('edit-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!currentPostId) return;
  const title = $('edit-title').value.trim();
  const content = $('edit-content').value.trim();

  if (title && content) {
    fetch(`${baseURL}/${currentPostId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    })
      .then(() => fetchPosts())
      .then(() => showPost(currentPostId));
  }
});

fetchPosts();

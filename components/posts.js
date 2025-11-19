'use client';
import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import { togglePostLikeStatus } from '@/actions/posts';
import { useOptimistic } from 'react';

function Post({ post, action }) {
  const { title, image, userFirstName, createdAt, id, isLiked, content } = post;
  return (
    <article className="post">
      <div className="post-image">
        <img src={image} alt={title} />
      </div>
      <div className="post-content">
        <header>
          <div>
            <h2>{title}</h2>
            <p>
              Shared by {userFirstName} on{' '}
              <time dateTime={createdAt}>{formatDate(createdAt)}</time>
            </p>
          </div>
          <form
            action={action.bind(null, id)}
            className={isLiked ? 'liked' : ''}
          >
            <LikeButton />
          </form>
        </header>
        <p>{content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {
  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(
    posts,
    (prevPosts, updatedPostId) => {
      const updatedPostIndex = prevPosts.findIndex(
        (post) => post.id === updatedPostId
      );
      if (updatedPostIndex === -1) {
        return prevPosts;
      }

      const updatedPost = {
        ...prevPosts[updatedPostIndex],
      };

      updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
      updatedPost.isLiked = !updatedPost.isLiked;

      const newPosts = [...prevPosts];
      newPosts[updatedPostIndex] = updatedPost;
      return newPosts;
    }
  );

  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    await togglePostLikeStatus(postId);
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}

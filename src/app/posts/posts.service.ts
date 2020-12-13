import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Post } from './post.model';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({providedIn: 'root'})
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject < { posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pageSize=${postsPerPage}&page=${currentPage}`
    this.http.get<{ message: string, posts: any, maxPosts: number }>(BACKEND_URL + queryParams)
   .pipe(map((postsData) => {
     return {
       posts: postsData.posts.map(post => {
         return {
           title: post.title,
           content: post.content,
           id: post._id,
           imagePath: post.imagePath,
           creator: post.creator
         }
       }), maxPosts: postsData.maxPosts
     }
   }))
      .subscribe((transformedPostData) => {
        console.log(transformedPostData);
     this.posts = transformedPostData.posts
     this.postsUpdated.next({
       posts: [...this.posts],
       postCount: transformedPostData.maxPosts
     })
   })
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(BACKEND_URL + id)
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title)

    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
      .subscribe((responseData) => {
    this.router.navigate(['/']);
      });
  }

  updatePosts(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof (image) === 'object') {
       postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
       postData = {
        id: id,
        title: title,
        content: content,
         imagePath: image,
         creator: null
      }
   }
    this.http.put(BACKEND_URL + id, postData)
    .subscribe(res => {
      this.router.navigate(['/']);
    })
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId)
  }

}

import {Component, Inject, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Todo} from "./model/todo.model";
import {CommonModule} from "@angular/common";
import {AddTodoForm} from "./model/add-todo-form.model";
import {APP_BASE_URL} from "../main";
import {AddTodoResponse} from "./model/add-todo-response.model";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="container">
        <h1 class="title">Todo List</h1>

        <form #form="ngForm" (ngSubmit)="submitFormHandler(form.value); form.reset()" class="add-todo-form">
          <div class="form-group">
            <label class="control-label" for="title">Todo title</label>
            <input id="title" #titleControl="ngModel" [class.title-control--invalid]="titleControl.touched && titleControl.invalid" class="title-control" type="text" minlength="4" required ngModel name="title">
          </div>
          <button [disabled]="form.invalid" class="add-todo-btn">Add todo</button>
        </form>

        <ul class="todos-list">
          <li class="todos-list__item" *ngFor="let todo of todos; let i = index">
            <input (ngModelChange)="editTodoCompletedHandler({ completed: $event, index: i, id: todo.id })" [disabled]="todo.isEditing" [id]="todo.id" type="checkbox" [ngModel]="todo.completed" />
            <ng-container *ngIf="!todo.isEditing">
              <label [for]="todo.id" [class.todo-checked]="todo.completed">{{ todo.title }}</label>
              <button type="button" (click)="todo.isEditing = true">Edit</button>
            </ng-container>
            <ng-container *ngIf="todo.isEditing">
              <input type="text" [ngModel]="todo.title" name="title" #editTitleControl="ngModel" />
              <button type="button" (click)="todo.isEditing = false; editTodoTitleHandler({ title: editTitleControl.value, id: todo.id, index: i })">Save</button>
            </ng-container>
            <button (click)="deleteTodoHandler(todo.id, i)" type="button">X</button>
          </li>
        </ul>
    </div>
  `,
  styles: [`
    .container {
      margin: 30px auto 0;
      padding: 10px;
      width: 50%;
      max-width: 480px;
    }

    .form-group {
      display: flex;
      flex-flow: column nowrap;
      gap: 3px;
      flex: 1;
    }

    .todo-checked {
      text-decoration: line-through;
    }

    .control-label {
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .add-todo-btn {
      appearance: none;
      background: dodgerblue;
      border: none;
      cursor: pointer;
      border-radius: 4px;
      color: white;
      flex-basis: 120px;
      min-height: 30px;

      &:not(:disabled):hover {
        background: darken(dodgerblue, 5%);
      }

      &:disabled {
        background: lightgray;
        color: black;
        opacity: .6;
        cursor: not-allowed;
      }
    }

    .title-control {
      padding: 6px 8px;
      border: 1px solid black;

      &:focus {
        outline: none;
      }

      &:not(.title-control--invalid):focus {
        border-color: dodgerblue;
        box-shadow: 0 0 4px 2px rgba(dodgerblue, .4);
      }

      &--invalid {
        border-color: red;

        &:focus {
          box-shadow: 0 0 4px 2px rgba(darkred, .4);
        }
      }
    }

    .add-todo-form {
      display: flex;
      flex-flow: nowrap;
      gap: 12px;
      align-items: flex-end;
    }

    .title {
      text-align: center;
    }

    .todos-list {
      margin: 20px 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-flow: column nowrap;
      gap: 10px;

      &__item {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 8px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  todos: (Todo & { isEditing: boolean})[] = [];

  constructor(
    private httpClient: HttpClient,
    @Inject(APP_BASE_URL) private baseUrl: string
  ) {
  }

  ngOnInit(): void {
    this.httpClient.get<Todo[]>(`${this.baseUrl}/todos`, {
      params: {
        _limit: 20
      }
    }).subscribe(todos => this.todos = todos.map(t => ({ ...t, isEditing: false })));
  }

  submitFormHandler({ title }: AddTodoForm): void {
    this.httpClient.post<AddTodoResponse>(`${this.baseUrl}/todos`, {
      title,
      completed: false
    }).subscribe(({ title, completed }) => {
      this.todos = [{ id: null, userId: null, title, completed, isEditing: false }, ...this.todos];
    })
  }

  deleteTodoHandler(todoId: number | null, index: number): void {
    if (todoId === null) {
      this.todos = this.todos.filter((todo, i) => i !== index);
      return;
    }

    this.httpClient.delete<void>(`${this.baseUrl}/todos/${todoId}`)
      .subscribe(() => {
        this.todos = this.todos.filter(todo => todo.id !== todoId);
      });
  }

  editTodoCompletedHandler({ id, index, completed }: { id: number | null, index: number, completed: boolean }): void {
    if (!id) {
      this.todos = this.todos.map((todo, todoIndex) => todoIndex === index ? {...todo, completed} : todo);
      return;
    }

    this.httpClient.put(`${this.baseUrl}/todos/${id}`, {
      completed
    }).subscribe(() => {
      this.todos = this.todos.map(todo => todo.id === id ? {...todo, completed } : todo);
    });
  }
  editTodoTitleHandler({ title, id, index }: { title: string, id: number | null, index: number }): void {
    if (!id) {
      this.todos = this.todos.map((todo, todoIndex) => todoIndex === index ? {...todo, title} : todo);
      return;
    }

    this.httpClient.put<Todo>(`${this.baseUrl}/todos/${id}`, {
      title
    }).subscribe(() => {
      this.todos = this.todos.map((todo) => todo.id === id ? { ...todo, title } : todo);
    });
  }

}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FriendService } from '../../../../services/friends.service';
import { CommonTableComponent } from '../../../common/common-table/common-table.component';
import { TableAction, TableColumn } from '../../../../interface/table.interface';

@Component({
  selector: 'app-addfriend',
  standalone: true,
  imports: [FormsModule, CommonModule,CommonTableComponent],
  templateUrl: './addfriend.component.html',
  styleUrls: ['./addfriend.component.css']
})
export class AddfriendComponent {
  searchTerm: string = '';
  searchResults: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  hasSearched: boolean = false; // New state to track if search was performed


  // Define columns (example: only username)
    tableColumns: TableColumn[] = [
      { header: 'Profile', field: 'profilePicture', isImage: true },
      { header: 'Username', field: 'userName' }
    ];
  
    // Define primary action: Message button (always visible)
    primaryActions: TableAction[] = [
      {
        label: 'Send Request',
        action: (row: any) => this.sendFriendRequest(row._id),
        class: '!bg-green-500 hover:!bg-green-600 px-4 py-2 text-sm rounded-md',
        display: "label"
      }
    ];


  constructor(private friendService: FriendService) {}

  /**
   * Triggers the search for users by username.
   */
  searchUser(): void {
    const trimmedUsername = this.searchTerm.trim();
    if (!trimmedUsername) {
      this.errorMessage = 'Please enter a username';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.searchResults = [];
    this.hasSearched = true; // Mark that a search has been performed

    this.friendService.searchUserByUsername(trimmedUsername)
      .subscribe({
        next: (response: any []) => {
          this.searchResults = response.map(req => ({
            profilePicture: req?.profilePicture, // may be undefined if not provided
            userName: req.userName,
            _id: req._id,
            sender: req  // preserve original if needed
          }));
          console.log(this.searchResults);
          
          this.isLoading = false;
          if (response.length === 0) {
            this.errorMessage = 'No users found.';
          }
        },
        error: (err) => {
          console.error('Error searching for user:', err);
          this.errorMessage = 'Error searching for user. Please try again later.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Call the backend to send a friend request.
   * @param userId The ObjectId of the user to add.
   */
  sendFriendRequest(userId: string): void {
    this.friendService.sendFriendRequest(userId)
      .subscribe({
        next: () => {
          this.showMessage('Friend request sent!', 'success');
        },
        error: (err) => {
          this.showMessage(err.message || 'Failed to send friend request.', 'error');
        }
      });
  }

  /**
   * Show a disappearing modal message.
   * @param message Message to display.
   * @param type 'success' | 'error'
   */
  private showMessage(message: string, type: 'success' | 'error'): void {
    if (type === 'success') {
      this.successMessage = message;
    } else {
      this.errorMessage = message;
    }

    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000); // Message disappears after 3 seconds
  }
}

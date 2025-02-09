import { Component } from '@angular/core';
import { FriendService } from '../../../../services/friends.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blocked',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './blocked.component.html',
  styleUrl: './blocked.component.css'
})
export class BlockedComponent {
  blockedUsers: any[] = [];         // Full list of blocked users
  filteredBlockedUsers: any[] = []; // Filtered list based on search input
  searchTerm: string = '';          // Bound to the search input
  hasSearched: boolean = false;     // Flag to determine if a search was performed
  errorMessage: string = '';

  // Replace 'user123' with the authenticated user's ID as needed
  private currentUserId: string = 'user123';

  constructor(private friendService: FriendService) {}

  ngOnInit(): void {
    this.loadBlockedUsers();
  }

  // Fetch all blocked users for the current user
  loadBlockedUsers(): void {
    this.friendService.getBlockedUsers().subscribe({
      next: (users) => {
        this.blockedUsers = users;
        this.filteredBlockedUsers = users;
        console.log(users);
      },
      error: (error) => {
        console.error("Error fetching blocked users:", error);
        this.errorMessage = "Failed to load blocked users.";
      }
    });
  }
  

  // Filter blocked users based on search input
  searchBlockedUsers(): void {
    const trimmedSearch = this.searchTerm.trim().toLowerCase();
    this.hasSearched = true;

    if (!trimmedSearch) {
      this.filteredBlockedUsers = this.blockedUsers;
      return;
    }

    this.filteredBlockedUsers = this.blockedUsers.filter(user =>
      user.userName.toLowerCase().includes(trimmedSearch)
    );
  }

  // Unblock a user
  unblockUser(blockedUserId: string): void {
    if (confirm('Are you sure you want to unblock this user?')) {
      this.friendService.unblockUser(blockedUserId).subscribe({
        next: () => {
          // Remove the unblocked user from both arrays
          this.blockedUsers = this.blockedUsers.filter(user => user._id !== blockedUserId);
          this.filteredBlockedUsers = this.filteredBlockedUsers.filter(user => user._id !== blockedUserId);
        },
        error: (error) => {
          console.error('Error unblocking user:', error);
          this.errorMessage = 'Failed to unblock user.';
        }
      });
    }
  }
}

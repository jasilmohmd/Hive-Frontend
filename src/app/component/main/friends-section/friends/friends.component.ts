import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FriendService } from '../../../../services/friends.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './friends.component.html',
  styleUrl: './friends.component.css'
})
export class FriendsComponent implements OnInit {
  friends: any[] = [];  // Store friend list
  errorMessage: string = ''; // Error handling
  filteredFriends: any[] = []; // Store filtered results
  searchTerm: string = '';     // Search input binding
  hasSearched: boolean = false; // Track if search was performed
  dropdownOpen: string | null = null;

  showSearchBar = true;
  private lastScrollTop = 0;

  constructor(private router: Router, private friendsService: FriendService, private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.loadFriends();  // Fetch friends on component load
  }

  // Fetch all friends
  loadFriends(): void {

    // const dummyFriends = [
    //   { _id: '1', userName: 'Alice Johnson' },
    //   { _id: '2', userName: 'Bob Smith' },
    //   { _id: '3', userName: 'Charlie Brown' },
    //   { _id: '4', userName: 'David White' },
    //   { _id: '5', userName: 'Emma Davis' },
    //   { _id: '6', userName: 'Franklin Harris' },
    //   { _id: '7', userName: 'Grace Martinez' },
    //   { _id: '8', userName: 'Henry Wilson' },
    //   { _id: '9', userName: 'Isabella Thompson' },
    //   { _id: '10', userName: 'Jack Anderson' },
    //   { _id: '11', userName: 'Katherine Moore' },
    //   { _id: '12', userName: 'Liam Scott' },
    //   { _id: '13', userName: 'Mia Garcia' },
    //   { _id: '14', userName: 'Noah Robinson' },
    //   { _id: '15', userName: 'Olivia Clark' },
    //   { _id: '16', userName: 'Patrick Lewis' },
    //   { _id: '17', userName: 'Quinn Walker' },
    //   { _id: '18', userName: 'Ryan Hall' },
    //   { _id: '19', userName: 'Sophia Young' },
    //   { _id: '20', userName: 'Thomas King' }
    // ];

    // this.friends = dummyFriends;
    // this.filteredFriends = dummyFriends;

    this.friendsService.getAllFriends().subscribe({
      next: (response) => {
        this.friends = response; // Store the friends list
        this.filteredFriends = response; // Default filtered list = full list
        console.log(response);

      },
      error: (error) => {
        console.error('Error fetching friends:', error);
        this.errorMessage = 'Failed to load friends list';
      }
    });
  }

  // Filter friends based on search input
  searchFriends(): void {
    const trimmedSearch = this.searchTerm.trim().toLowerCase();
    this.hasSearched = true;

    if (!trimmedSearch) {
      this.filteredFriends = this.friends; // Reset list if empty search
      return;
    }

    this.filteredFriends = this.friends.filter(friend =>
      friend.userName.toLowerCase().includes(trimmedSearch)
    );
  }

  unfriend(friendId: string): void {
    if (confirm('Are you sure you want to unfriend this user?')) {
      this.friendsService.unfriendUser(friendId).subscribe({
        next: () => {
          this.filteredFriends = this.filteredFriends.filter(friend => friend.id !== friendId);
        },
        error: (error) => {
          console.error('Error unfriending user:', error);
        }
      });
    }
  }


  blockUser(friendId: string): void {
    if (confirm('Are you sure you want to block this user?')) {
      console.log(friendId);
      
      this.friendsService.blockUser(friendId).subscribe({
        next: () => {
          this.filteredFriends = this.filteredFriends.filter(friend => friend.id !== friendId);
        },
        error: (error) => {
          console.error('Error blocking user:', error);
        }
      });
    }
  }


  toggleDropdown(friendId: string): void {
    this.dropdownOpen = this.dropdownOpen === friendId ? null : friendId;
  }

  @HostListener('window:scroll', [])
  onScroll() {
    console.log("hi");
    
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop + 10) {
      this.showSearchBar = false;
    } else if (scrollTop < this.lastScrollTop - 10) {
      this.showSearchBar = true;
    }

    this.lastScrollTop = scrollTop;
    this.cdr.detectChanges(); // Force update
  }




}

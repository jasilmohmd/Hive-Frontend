import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { FriendService } from '../../../../services/friends.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-online',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './online.component.html',
  styleUrl: './online.component.css'
})
export class OnlineComponent {
  onlineFriends: any[] = [];  // Store online friends
  errorMessage: string = '';
  filteredOnlineFriends: any[] = [];  // Store filtered list of online friends based on search
  searchTerm: string = '';  // Search term entered by the user
  hasSearched: boolean = false; // Track if search was performed
  dropdownOpen: string | null = null;

  showSearchBar = true;
  private lastScrollTop = 0;

  constructor(private friendsService: FriendService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadOnlineFriends();  // Fetch online friends on component load
  }

  // Fetch online friends
  loadOnlineFriends(): void {

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

    // this.onlineFriends = dummyFriends;
    // this.filteredOnlineFriends = dummyFriends;

    this.friendsService.getOnlineFriends().subscribe({
      next: (response) => {
        this.onlineFriends = response; // Store the online friends list
        this.filteredOnlineFriends = response; // Default filtered list = full list
        console.log(response);
      },
      error: (error) => {
        console.error('Error fetching online friends:', error);
        this.errorMessage = 'Failed to load online friends list';
      }
    });
  }

  // Search online friends based on search term
  searchOnlineFriends(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.hasSearched = true;

    if (!searchTermLower) {
      this.filteredOnlineFriends = [...this.onlineFriends]; // If search is empty, show all online friends
      return;
    }

    this.filteredOnlineFriends = this.onlineFriends.filter(friend =>
      friend.userName.toLowerCase().includes(searchTermLower) // Filter based on userName
    );
  }

  unfriend(friendId: string): void {
      if (confirm('Are you sure you want to unfriend this user?')) {
        this.friendsService.unfriendUser(friendId).subscribe({
          next: () => {
            this.filteredOnlineFriends = this.filteredOnlineFriends.filter(friend => friend.id !== friendId);
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
            this.filteredOnlineFriends = this.filteredOnlineFriends.filter(friend => friend.id !== friendId);
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

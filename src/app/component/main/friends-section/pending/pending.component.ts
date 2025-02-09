import { Component, OnInit } from '@angular/core';
import { FriendService } from '../../../../services/friends.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingComponent implements OnInit {
  pendingRequests: any[] = [];

  constructor(private friendsService: FriendService) { }

  ngOnInit(): void {
    this.loadPendingRequests();
  }

  // Fetch pending requests
  loadPendingRequests(): void {
    this.friendsService.getPendingRequests().subscribe(
      (response: any) => {
        this.pendingRequests = response;
        console.log(this.pendingRequests);
        
      },
      (error) => {
        console.error('Error fetching pending requests:', error);
      }
    );
  }

  // Accept a friend request
  acceptRequest( senderId: string): void {
    this.friendsService.acceptRequest(senderId).subscribe(() => {
      this.pendingRequests = this.pendingRequests.filter(req => req.sender._id !== senderId);
    });
  }

  // Reject a friend request
  rejectRequest(senderId: string): void {
    this.friendsService.rejectRequest(senderId).subscribe(() => {
      this.pendingRequests = this.pendingRequests.filter(req => req.sender._id !== senderId);
    });
  }
}

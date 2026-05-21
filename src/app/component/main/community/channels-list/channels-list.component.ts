import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { catchError, forkJoin, of, Subscription, switchMap } from 'rxjs';
import { IChannel } from '../../../../models/channel';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FriendService } from '../../../../services/friends.service';
import { IUser } from '../../../../models/user';
import { IRole } from '../../../../models/role';
import { ChannelStateService } from '../../../../services/shared/channel-state.service';

@Component({
  selector: 'app-channels-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './channels-list.component.html',
  styleUrl: './channels-list.component.css'
})
export class ChannelsListComponent {

  @Input() communityId!: string;
  @Input() userRoles!: IRole[];

  // Grouped channels structured as an object with keys 'info', 'chatroom', and 'voice'
  channels: { [key in 'info' | 'chatroom' | 'voiceroom']?: IChannel[] | null } = { info: [], chatroom: [], voiceroom: [] };
  isLoading: boolean = true;
  errorMessage: string | null = null;
  permissions: string[] = [];

  private subscriptions: Subscription = new Subscription();
  selectedRoomName = ''; // or selectedRoomId

  toggleRoom(room: any) {
    room.isOpen = !room.isOpen; 
  }

  constructor(
    private route: ActivatedRoute,
    private channelStateService: ChannelStateService,
    private userService: FriendService
  ) { }

  ngOnInit(): void {
    const channelSub = this.route.params.pipe(
      switchMap(params => {
        this.isLoading = true;
        this.errorMessage = null;
        const id = params['id'];
        if (!id) {
          this.errorMessage = 'Community ID not found';
          return of(null);
        }
        this.communityId = id;
        
        return this.channelStateService.loadAccessibleChannels(id,true).pipe(
          catchError(error => {            
            this.errorMessage = error.message || 'Failed to load community';
            return of(null);
          })
        );
      })
    ).subscribe(channels => {
      if (channels) {
        // Group the flat array of channels into the structured object.
        this.channels.info = channels.filter(channel => channel.type === 'info');
        this.channels.chatroom = channels.filter(channel => channel.type === 'chatroom');
        this.channels.voiceroom = channels.filter(channel => channel.type === 'voiceroom');
        // console.log(this.channels);
        
      } else {
        this.channels = { info: [], chatroom: [], voiceroom: [] };
      }

      // For voice channels, set isOpen default to true and populate participants.
      if (this.channels.voiceroom) {
        const updatedVoiceChannels = this.channels.voiceroom.map(channel => {
          channel.isOpen = channel.isOpen !== undefined ? channel.isOpen : true;
          if (channel.participants && channel.participants.length > 0 && typeof channel.participants[0] === 'string') {
            forkJoin(
              (channel.participants as string[]).map(id => this.userService.getUserDetails(id))
            ).subscribe({
              next: (users: IUser[]) => {
                channel.participantDetails = users;
              },
              error: (error) => {
                console.error('Error fetching user details:', error.message);
              }
            });
          }
          return channel;
        });
        this.channels.voiceroom = updatedVoiceChannels;
      }

      this.isLoading = false;
    });

    this.subscriptions.add(channelSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { ChannelsListComponent } from '../channels-list/channels-list.component';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import ICommunity from '../../../../models/community';
import { CommunityStateService } from '../../../../services/shared/community-state.service';
import { RoleStateService } from '../../../../services/shared/role-state.service';
import { IRole } from '../../../../models/role';

@Component({
  selector: 'community-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ChannelsListComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class ComunityLayoutComponent implements OnInit, OnDestroy {
  communityId: string = "";
  community: ICommunity | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  userRoles: IRole[] = [];
  permissions: string[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private communityStateService: CommunityStateService,
    private roleStateService: RoleStateService
  ) { }

  ngOnInit(): void {
    const communitySub = this.route.params.subscribe(params => {
      this.communityId = params['id'];
      if (!this.communityId) {
        this.errorMessage = 'Community ID not found';
        this.isLoading = false;
        return;
      }

      this.communityStateService.loadCommunity(this.communityId).subscribe(community => {
        this.community = community;
        // console.log(community);
        this.isLoading = false;
      });

      // Load user roles via the RoleStateService.
      this.roleStateService.loadUserRoles(this.communityId).subscribe();

      // Subscribe to role state updates.
      const rolesSub = this.roleStateService.userRoles$.subscribe(roles => {
        this.userRoles = roles;
      });
      const permsSub = this.roleStateService.permissions$.subscribe(perms => {
        this.permissions = perms;
      });

      this.subscriptions.add(rolesSub);
      this.subscriptions.add(permsSub);

    });

    this.subscriptions.add(communitySub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}

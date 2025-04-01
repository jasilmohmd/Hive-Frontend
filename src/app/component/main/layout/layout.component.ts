import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CreateCommunityLayoutComponent } from '../create-community/layout/layout.component';
import { CommonModule } from '@angular/common';
import { CommunityService } from '../../../services/community.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule,RouterModule,RouterOutlet,CreateCommunityLayoutComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit{
  showCommunityCreateModal = false;
  communities:any[] = []

  constructor( private communityService: CommunityService, private sanitizer: DomSanitizer ) {}


  ngOnInit(): void {
    this.loadCommunities();
  }


  loadCommunities(){
    this.communityService.getCommunitiesByUser().subscribe({
      next: (response)=>{
        this.communities = response
      },
      error: (error)=>{
        console.log(error.message);
        
      }
    })
  }

  getSafeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  toggleCommunityCreateModal(): void {
    this.showCommunityCreateModal = !this.showCommunityCreateModal;
    console.log('Modal visibility:', this.showCommunityCreateModal);
  }
}

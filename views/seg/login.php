<?php
namespace Destiny;
use Destiny\Common\Config;
use Destiny\Common\Session\Session;
use Destiny\Common\User\UserRole;
?>
<?php if(!Session::hasRole(UserRole::USER)): ?>
<div class="modal" id="loginmodal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-body">
                <form action="/login" method="post">
                    <input type="hidden" name="follow" value="" />
                    <input type="hidden" name="grant" value="" />
                    <input type="hidden" name="authProvider" class="hidden" />
                    <div id="loginproviders">
                        <?php foreach (Config::$a['authProfiles'] as $i => $id): ?>
                            <a class="btn btn-lg btn-<?=$id?>" tabindex="<?=$i+1?>" data-provider="<?=$id?>">
                                <i class="fab fa-<?=$id?>"></i> <?=ucwords($id)?>
                            </a>
                        <?php endforeach; ?>
                    </div>
                    <div class="form-group form-group-remember-me">
                        <div class="controls checkbox">
                            <label>
                                <input tabindex="1" autofocus type="checkbox" name="rememberme" <?=($this->rememberme) ? 'checked':''?>> Remember me
                            </label>
                            <span class="help-block">(this should only be used if you are on a private computer)</span>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>
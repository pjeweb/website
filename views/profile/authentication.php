<?php
namespace Destiny;
use Destiny\Common\Config;
use Destiny\Common\Utils\Date;
use Destiny\Common\Utils\Tpl;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?=Tpl::title($this->title)?>
    <?php include 'seg/meta.php' ?>
    <?=Tpl::manifestLink('web.css')?>
</head>
<body id="authentication" class="no-contain">
<div id="page-wrap">

    <?php include 'seg/nav.php' ?>
    <?php include 'menu.php' ?>

    <section id="connectTools" class="container">
        <button id="connectSelectToggleBtn" title="Toggle" class="btn btn btn-dark"><i class="far fa-circle"></i></button>
        <button id="connectNewConnBtn" accesskey="n" class="btn btn-primary" data-toggle="modal" data-target="#connectModal">Connect</button>
        <button id="connectRemoveBtn" accesskey="d" class="btn btn-danger" disabled>Remove</button>
        <form id="connectToolsForm" method="post"></form>
    </section>

    <section class="container">

        <h3 data-toggle="collapse" data-target="#connections-content">Logins</h3>
        <div id="connections-content" class="content collapse show">
            <div class="content-dark clearfix">
                <?php if(!empty($this->authProfiles)): ?>
                    <table class="grid">
                        <thead>
                        <tr>
                            <td class="selector"></td>
                            <td>Provider</td>
                            <td>Detail</td>
                            <td>Created</td>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach($this->authProfiles as $auth): ?>
                            <tr data-id="<?=Tpl::out($auth['id'])?>">
                                <td class="selector"><i class="far fa-circle"></i></td>
                                <td><?=Tpl::out($auth['authProvider'])?></td>
                                <td title="<?=Tpl::out($auth['authId'])?>"><?=!empty($auth['authDetail']) ? Tpl::out($auth['authDetail']):Tpl::out($auth['authId'])?></td>
                                <td><?=Tpl::moment(Date::getDateTime($auth['createdDate']), Date::STRING_FORMAT_YEAR)?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else: ?>
                    <div class="ds-block">
                        <p>No connections</p>
                    </div>
                <?php endif ?>

            </div>
        </div>

    </section>

</div>

<div class="modal" id="connectModal" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-body">
                <div id="loginproviders">
                    <?php foreach (Config::$a['authProfiles'] as $i => $id): ?>
                        <a href="/profile/connect/<?=$id?>" class="btn btn-lg btn-<?=$id?>" tabindex="<?=$i+1?>" data-provider="<?=$id?>">
                            <i class="fab fa-<?=$id?>"></i> <?=ucwords($id)?>
                        </a>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'seg/alerts.php' ?>
<?php include 'seg/foot.php' ?>
<?php include 'seg/tracker.php' ?>
<?=Tpl::manifestScript('runtime.js')?>
<?=Tpl::manifestScript('common.vendor.js')?>
<?=Tpl::manifestScript('chat.vendor.js')?>
<?=Tpl::manifestScript('web.js')?>
<?=Tpl::manifestScript('profile.js')?>

</body>
</html>
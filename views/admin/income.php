<?php
use Destiny\Common\Utils\Tpl;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <?=Tpl::title($this->title)?>
    <?php include 'seg/meta.php' ?>
    <?=Tpl::manifestLink('web.css')?>
</head>
<body id="admin" class="no-contain">
<div id="page-wrap">

    <?php include 'seg/nav.php' ?>
    <?php include 'seg/admin.nav.php' ?>

    <section class="container">
        <h3 id="income-dates">
            <span id="date-selector" class="dgg-date-selector">
                <button role="button" class="dgg-date-selector__button dgg-date-selector__button--left js-dgg-date-selector-left">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <span class="dgg-date-selector__display js-dgg-date-selector-date"></span>
                <button role="button" class="dgg-date-selector__button dgg-date-selector__button--right js-dgg-date-selector-right">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </span>
        </h3>
        <div class="row" id="income-graphs">
            <div class="col-md-6 col-sm-12">
                <div id="graph4">
                    <div class="graph-outer">
                        <canvas height="350"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-sm-12">
                <div id="graph5">
                    <div class="graph-outer">
                        <canvas height="350"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-12">
                <div id="graph1">
                    <div class="graph-outer">
                        <canvas height="300"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-6 col-sm-12">
                <div id="graph2">
                    <div class="graph-outer">
                        <canvas height="300"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-4 col-md-12 col-sm-12">
                <div id="graph3">
                    <div class="graph-outer">
                        <canvas height="300"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </section>

</div>

<?php include 'seg/alerts.php' ?>
<?php include 'seg/foot.php' ?>
<?php include 'seg/tracker.php' ?>
<?=Tpl::manifestScript('runtime.js')?>
<?=Tpl::manifestScript('common.vendor.js')?>
<?=Tpl::manifestScript('web.js')?>
<?=Tpl::manifestScript('admin.js')?>

</body>
</html>